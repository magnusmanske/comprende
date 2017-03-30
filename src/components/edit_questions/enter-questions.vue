<template>
<div>

<div v-if='stage==2'>
<h2 class="card-title"><i18n k='Enter new questions'/></h2>
<edit-question v-for='(question,qnumber) in questions' :key='qnumber' :question='question' v-on:delete_question='deleteQuestion'></edit-question>

<div class="card card-stack">
<div class="card-block">
<button class='btn btn-outline-success' @click.prevent='addNewQuestion(wdid.q_multiple_choice_question)'><i18n k='Add new multiple-choice question'/></button>
</div></div>


<div class="card card-stack">
<div class="card-block">

<div><label><input type='checkbox' v-model='create_new_quiz' /> <i18n k='Create new quiz with the selected questions'/></label></div>

<div>
<string-edit label='Name of quiz' :value='quiz'></string-edit>
</div>

<div v-if='questions.length>0'>
<button v-if='canBeImported' class='btn btn-outline-primary' @click.prevent='doCreate'>Create questions {{create_new_quiz?'and quiz':''}} in Comprende!</button>
<div v-else class='alert alert-danger'><i18n k='There are problems in questions' :params='[problems]' /></div>
</div>

</div>
</div>
</div>

<div v-if='stage==3'>
Questions <span v-if='create_new_quiz'>and quiz</span> are being created. {{new_items.length}} of {{questions.length}} questions have been created.
</div>


<div v-if='stage==4'>
Questions <span v-if='(create_new_quiz && quiz_id!="")'>and <router-link :to='"/quiz/"+quiz_id'>quiz</router-link></span> were created!
</div>


</div>
</template>


<script>
import i18n from '../i18n.vue'
import newQuestionsMixin from '../../mixins/newQuestionsMixin.vue'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'
import wikibase_default_site from '../../config/wikibase_default_site.js'
import wdid from '../../config/wdid.js'
import StringEdit from '../string-edit.vue'
import EditQuestion from './edit-question.vue'

export default {
	mixins : [ wikibaseAPImixin , newQuestionsMixin ] ,
	props : [ 'questions' ] ,
	data : function () { return { stage:2 , create_new_quiz:false , quiz:{text:'',language:''} , quiz_id:'' , new_items:[] , new_items_num:0 , problems:0 , wdid } } ,
	components : { 'string-edit':StringEdit , 'edit-question':EditQuestion , i18n } ,
	created : function () { this.quiz.language = this.getCurrentLanguage() ; } ,
	computed : {
		canBeImported : function () {
			var me = this ;
			me.problems = 0 ;
			$.each ( me.questions , function ( k , v ) {
				if ( !v.can_be_imported ) me.problems++ ;
			} ) ;
			return me.problems == 0 ;
		}
	} ,
	methods : {
		deleteQuestion : function ( id ) {
			var me = this ;
			$.each ( me.questions , function ( k , v ) {
				if ( v.id != id ) return ;
				me.questions.splice ( k , 1 ) ;
				return false ;
			} ) ;
		} ,
		createNewItem : function ( data , callback ) {
			var me = this ;
			
			// Paranoia: Label etc. length filter
			$.each ( ['labels','descriptions','aliases'] , function ( dummy , key ) {
				$.each ( (data[key]||{}) , function ( language , v ) {
					v.value = v.value.substr(0,250) ;
				} ) ;
			} ) ;
			
			var data_json = JSON.stringify(data) ;
			me.getToken ( function ( token ) {
				$.post ( wikibase_default_site.api , {
					action:'wbeditentity',
					'new':'item',
					token:token,
					data:data_json,
					format:'json'
				} , function ( d ) {
					if ( d.success == 1 ) {
						callback ( d.entity.id ) ;
					} else {
						console.log ( "Error creating item" , d ) ;
						callback ( '' ) ;
					}
				} , 'json' ) ;
			} ) ;
		} ,
		createAnswer : function ( answer ) {
			var me = this ;
			var ret = {} ;
			var qualifiers = {} ;
			qualifiers[wdid.p_fraction] = [] ;
			qualifiers[wdid.p_fraction].push ( me.newClaimQuantity ( { amount:answer.fraction.text , property:wdid.p_fraction } ) . mainsnak ) ;
			
			if ( $.trim(answer.feedback.text) != '' ) {
				qualifiers[wdid.p_hint] = [] ;
				qualifiers[wdid.p_hint].push ( me.newClaimMonolingual ( { text:answer.feedback.text , property:wdid.p_hint , language:answer.feedback.language } ) . mainsnak ) ;
			}

			if ( answer.type == wdid.p_text_answer ) {
				if ( answer.text.format == 'html' && answer.text.text.match(/</) ) { // Marked as HTML, contains HTML
					qualifiers[wdid.p_type] = [] ;
					qualifiers[wdid.p_type].push ( me.newClaimItem ( { id:wdid.q_html , property:wdid.p_type } ) . mainsnak ) ;
				}
				ret = me.newClaimMonolingual ( { text:answer.text.text , property:answer.type , language:answer.text.language , qualifiers:qualifiers } ) ;
			} else if ( answer.type == wdid.p_wd_answer ) {
				ret = me.newClaimString ( { value:answer.text.item , property:answer.type , qualifiers:qualifiers } ) ;
			} else {
				console.log ( "Unknown answer type" , answer ) ;
			}
			return ret ;
		} ,
		finishCreatingQuestions : function () {
			var me = this ;
			if ( !me.create_new_quiz || me.new_items_num == 0 ) { me.stage = 4 ; return ; }
			
			// Create quiz
			var item = { labels:{} , claims:[] } ;
			item.labels[me.quiz.language] = { language:me.quiz.language , value:me.quiz.text } ; // Label
			item.claims.push ( me.newClaimItem ( { id:wdid.q_quiz , property:wdid.p_type } ) ) ; // Type
			$.each ( me.new_items , function ( num , q ) { // Question list
				var qualifiers = {} ;
				qualifiers[wdid.p_serial_number] = [] ;
				qualifiers[wdid.p_serial_number].push ( me.newClaimQuantity ( { amount:num+1 , property:wdid.p_serial_number } ) . mainsnak ) ;
				item.claims.push ( me.newClaimItem ( { id:q , property:wdid.p_part , qualifiers:qualifiers } ) ) ;
			} ) ;
			me.createNewItem ( item , function ( q ) {
				me.quiz_id = q ;
				me.stage = 4 ;
			} ) ;
		} ,
		createAllItems : function ( items ) {
			var me = this ;
			if ( items.length == 0 ) return me.finishCreatingQuestions() ;
			var item = items.shift() ;
			me.createNewItem ( item.data , function ( q ) {
				if ( item.add2quiz && q != '' ) {
					me.new_items.push ( q ) ;
					me.new_items_num++ ;
				}
				me.createAllItems ( items ) ;
			} ) ;
		} ,
		doCreate : function () {
			var me = this ;
			me.new_items = [] ;
			me.new_items_num = 0 ;
			me.stage = 3 ;
			var todo = [] ;
			$.each ( me.questions , function ( k , question ) {
				if ( !question.import2wb ) return ; // Skip this one
				var item = { labels:{} , descriptions:{} , claims:[] } ;
				item.labels[question.label.language] = { language:question.label.language , value:question.label.text } ; // Label
				item.descriptions[question.text.language] = { language:question.text.language , value:question.text.text } ; // Question text
				
				item.claims.push ( me.newClaimItem ( { id:question.type , property:wdid.p_type } ) ) ; // Type
				if ( $.trim(question.hint.text||'') != '' ) item.claims.push ( me.newClaimMonolingual ( { text:question.hint.text , property:wdid.p_hint , language:question.hint.language } ) ) ; // Hint
				$.each ( question.answers , function ( k , answer ) {
					item.claims.push ( me.createAnswer ( answer ) ) ;
				} ) ;
				
				todo.push ( { data:item , add2quiz:question.add2quiz } ) ;
			} ) ;
			me.createAllItems ( todo ) ;
		} ,
		addNewQuestion : function ( type ) {
			var me = this ;
			var new_question = me.getNewQuestion ( type ) ;
			if ( type == wdid.q_multiple_choice_question ) { // Two default answers
				new_question.answers.push ( { fraction : { text:'100' }, text : { text:'' , item:'' , language:wikibase_default_site.language } , feedback : { text:'' , item:'' , language:wikibase_default_site.language } , type : wdid.p_text_answer } ) ;
				new_question.answers.push ( { fraction : { text:'0' }, text : { text:'' , item:'' , language:wikibase_default_site.language } , feedback : { text:'' , item:'' , language:wikibase_default_site.language } , type : wdid.p_text_answer } ) ;
			}
			me.questions.push ( new_question ) ;
		} ,
	} ,
	watch: {
		'quiz.text' : function ( to , from ) {
			this.create_new_quiz = $.trim(this.quiz.text) != '' ;
		}
	}
}
</script>

<style>
</style>
