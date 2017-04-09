<template>
<div v-if='loaded' class="card">
<div class="card-block">

<h4 class="card-title">
<div v-if='!thumbnail' style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this question' target='_blank'>{{q}}</a>]</div>
{{title}}
</h4>
<h6 class="card-subtitle mb-2 text-muted">{{subtitle}}</h6>
<question-intro :q='q'></question-intro>
<div class='answer_block'>
<answer v-for='(state,num) in answers' :key='num' :state='state' :check_choice='options.show_choices'></answer>
</div>
<div style='text-align:center;border-top:1px solid #EEE;' :class='numberSelectedClass' class='no-print'><i18n k='answers required selected' :params='[num_required,num_selected]'/></div>

</div>
</div>
</template>


<script>
import { wdid , wikidata_site , user } from '../../config.js'
import question_bus from './question_bus.vue'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'
import QuestionIntro from './question-intro.vue'
import answer from './answer.vue'
import i18n from '../i18n.vue'
import QuestionMixin from '../../mixins/QuestionMixin.vue'

export default {
	mixins : [ wikibaseAPImixin , QuestionMixin ] ,
	props: [ 'q' , 'options' , 'thumbnail' ] ,
	data : function () { return { i:{} , answers:[] , loaded:false , num_selected:0 , num_required:0 , has_been_answered:false , user } } ,
	created : function () { this.loadQuestion () } ,
	components : { 'question-intro':QuestionIntro , answer , i18n } ,
	methods : {
		loadQuestion : function () {
			var me = this ;
			me.has_been_answered = false ;
			me.num_selected = 0 ;
			me.loaded = false ;
			me.answers = [] ;
			me.i = me.getItem ( me.q ) ;
			me.setTitle() ;
			var wd_answers = me.i.getStringValues ( wdid.p_wd_answer ) ;
			
			function fin () {
				var answers = [] ;
				$.each ( (me.i.json.claims[wdid.p_text_answer]||[]) , function ( k , v ) { answers.push ( {q:me.q,sid:v.id,selected:false,fraction:0,checkable:true} ) } ) ;
				$.each ( (me.i.json.claims[wdid.p_wd_answer]||[]) , function ( k , v ) { answers.push ( {q:me.q,sid:v.id,selected:false,fraction:0,checkable:true} ) } ) ;
			
				me.num_required = 0 ;
				$.each ( answers , function ( dummy , answer ) {
					answer.thumbnail = me.thumbnail ;
					var s = me.i.getStatementByID ( answer.sid ) ;
					
					if ( typeof (s.qualifiers||{})[wdid.p_fraction] != 'undefined' ) {
						var qual = s.qualifiers[wdid.p_fraction][0] ;
						answer.fraction = qual.datavalue.value.amount * 1 ;
					}
					if ( answer.fraction > 0 ) me.num_required++ ;
					
					if ( typeof (s.qualifiers||{})[wdid.p_hint] != 'undefined' ) {
						$.each ( s.qualifiers[wdid.p_hint] , function ( dummy , qual ) { // TODO: abstract finding best language from monolingual qualifier
							if ( qual.datavalue.value.language != 'en' ) return ;
							answer.hint = { text:qual.datavalue.value.text , language:qual.datavalue.value.language } ;
						} ) ;
					}
					
				} ) ;
			
				me.answers = me.shuffle ( answers ) ;
				me.loaded = true ;
			}
			
			if ( wd_answers.length > 0 ) me.loadItemsSite ( wikidata_site , wd_answers , fin ) ;
			else fin() ;
		}
	} ,
	computed : {
		numberSelectedClass : function () {
			return {
				answer_cb_ok : (this.num_required == this.num_selected) ,
				answer_cb_nope : (this.num_required < this.num_selected)
			}
		}
	} ,
	watch : {
		q : function () { this.loadQuestion() } ,
		answers : {
			handler : function ( to , from ) {
				var me = this ;
				var cnt = 0 ;
				var sum = 0 ;
				$.each ( me.answers , function ( k , v ) {
					cnt += v.selected ? 1 : 0 ;
					if ( v.selected ) sum += v.fraction*1 ;
				} ) ;
				me.num_selected = cnt ;
				if ( me.num_required>0 && me.num_required==me.num_selected ) {
					me.$emit ( 'ready_to_check' ) ;
					if ( typeof question_bus != 'undefined' && !me.has_been_answered ) {
						me.has_been_answered = true ; // Let answer only once
						question_bus.$emit ( 'answered' , (sum>=100) , sum ) ;
					}
				}
			} ,
			deep : true
		} ,
		'user.settings' : { handler : function () { this.setTitle() } , deep : true } ,
	}
}
</script>

<style>
</style>
