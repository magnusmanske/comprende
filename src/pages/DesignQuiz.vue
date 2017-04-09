<template>
<div>
<nav-header></nav-header>

<div v-if='loaded' class="card">

	<div class='print-only'>
		<h1>{{quiz_label.text}}</h1>
		<p class='quiz_description'>{{quiz_desc.text}}</p>
	</div>

	<div class="card-block no-print">
		<h1 class="card-title">
			<div style='float:right;font-size:10pt;'>[<a :href='"./index.php?title=Item:"+q' target='_blank'>{{q}}</a>]</div>
			<i18n k='quiz'/>
		</h1>
	</div>

	<div class="card-block no-print">
<!--		<h3><i18n k='quiz details'/></h3>-->
		<string-edit label='Label' placeholder='A name for the quiz' :value='quiz_label' v-on:enter='saveChanges'></string-edit>
		<string-edit label='Description' placeholder='A description for the question' :value='quiz_desc' v-on:enter='saveChanges'></string-edit>
	</div>

	<div class="card-block no-print">
		<div style='margin-bottom:5px;'>
			<router-link v-if='!wasChanged()' class='btn btn-outline-primary' :to='"/quiz/"+q'><i18n k='play quiz'/></router-link>
			<span v-if='user.settings.can_edit'>
				<router-link target='_blank' class='btn btn-outline-success' to='/new/questions'><i18n k='create new questions'/></router-link>
				<button class='btn btn-outline-danger' @click.prevent='removeCurrentQuestion'><i18n k='remove question from quiz'/></button>
				<span v-if='wasChanged()'><button class='btn btn-primary' @click.prevent='saveChanges'><i18n k='save changes'/></button></span>
			</span>
			<span v-else><i18n k='you need to log in to edit'/></span>
		</div>
		<div>
			<wikibase-predictive-type style='display:inline;' placeholder_key='search for questions' v-on:set_item='setItemFromPredictive' nofocus='1' :site='wikibase_default_site' type='item' :type_filters='wdid.q_questions'></wikibase-predictive-type>
			<button v-if='item2add!=""' class='btn btn-outline-success' @click.prevent='addQuestion'><i18n k='add question to quiz'/></button>
		</div>
		<p><i18n k='total points in quiz' :params='[progress.total_points]'></i18n> <i18n k='total questions in quiz' :params='[progress.total]'></i18n></p>
	</div>

	<div class="card-block">
		<h3 class='no-print'><i18n k='questions'/></h3>
		<div class='no-print'><i18n k='drag drop questions'/></div>
		<div class='design_quiz_question_container'>

			<div v-for='(question_id,num) in sort_order' :key='question_id' class='card design_quiz_question_wrapper' :style='(num==current_question?"border-color:#2F74D0;":"")' @click.prevent='current_question=num'>
				<div class='design_quiz_question_header card-header'>
					<span class='no-print'>[<router-link :to='"/question/"+questions[question_id].q'>{{questions[question_id].q}}</router-link>]</span>
					<span class='print-only'>#{{num+1}}</span>
					<i18n k='quetion_counts' :params='[questions[question_id].points]'></i18n>
					<span class='no-print'><small>[<a href='#' @click.prevent='changePoints(num)'><i18n k='edit'/></a>]</small></span>
				</div>
				<question class='zoom_half' :q='questions[question_id].q' thumbnail='1'></question>
			</div>

		</div>
	</div>
</div>

<div v-else-if='typeof q=="undefined"' class='no-print'>
	<span v-if='user.settings.can_edit'>
		<button class='btn btn-outline-primary' @click.prevent='createNewQuiz'><i18n k='create new quiz'/></button>
	</span>
	<span v-else><i18n k='you need to log in to edit'/></span>
</div>
<div v-else><i><i18n k='loading'/></i></div>

</div>
</template>

<script>
import { wdid , wikibase_default_site } from '../config.js'
import i18n from '../components/i18n.vue'
import NavHeader from '../components/nav-header.vue'
import question from '../components/show_questions/question.vue'
import quiz_mixin from '../mixins/quiz.vue'
import predictive from '../components/wikibase-predictive-type.vue'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
import StringEdit from '../components/string-edit.vue'

export default {
	props : [ 'q' ] ,
	components : { 'string-edit':StringEdit , question , i18n , 'nav-header':NavHeader , 'wikibase-predictive-type':predictive } ,
	data : function () { return { actions:[] , item2add:'' , wikibase_default_site , quiz_label:{} , quiz_desc:{} } } ,
	mixins : [ quiz_mixin , i18n , wikibaseAPImixin ] ,
	created : function () { this.init() } ,
	updated : function () {
		var me = this ;
		if ( typeof me.q == 'undefined' ) return ;
		var container = $(me.$el).find('div.design_quiz_question_container') ;
		var c2 = container.get(0) ;
		if ( typeof c2 != 'undefined' ) {
			Sortable.create ( c2 , {
				draggable : '.design_quiz_question_wrapper' ,
				onUpdate : function ( ev ) {
					me.reorderQuestion ( ev.oldIndex , ev.newIndex ) ;
				}
			} ) ;
		}
	} ,
	methods : {
		init : function () {
			var me = this ;
			me.actions = [] ;
			if ( typeof me.q == 'undefined' ) return ;
			this.loadQuiz ( function () {
				me.quiz_label = { text:me.quiz_item.getLabel()[0] } ;
				me.quiz_desc = { text:me.quiz_item.getDescription()[0] } ;
			} ) ;
		} ,
		createNewQuiz : function () {
			var me = this ;
			var data = {
				claims : [
					me.newClaimItem ( { property:wdid.p_type , id:wdid.q_quiz } )
				]
			} ;
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
						me.$router.push ( '/design/quiz/'+d.entity.id ) ;
					} else {
						console.log ( "Error creating item" , d ) ;
					}
				} , 'json' ) ;
			} ) ;
		} ,
		changePoints : function ( qid ) {
			var me = this ;
			var question = me.getQuestion(qid) ;
			var old_points = question.points * 1 ;
			var points = prompt ( me.tr('points for question in quiz') , old_points ) ;
			if ( points === null || points == '' ) return ;
			points = points.replace ( /^\s*[\+\-]{0,1}\s*[^0-9\.]\s*$/g , '' ) ;
			points = 1 * points ;
			question.points = points ;
			me.progress.total_points += ( points - old_points ) ;
			if ( typeof question.statement == 'undefined' ) return ; // New question, will be created anyway, no point (pardon the pun) in adding another action
			me.actions.push ( { type:'change_points' , question:question } ) ;
		} ,
		setItemFromPredictive : function ( item ) {
			this.item2add = item ;
		} ,
		addQuestion : function () {
			var me = this ;
			if ( me.item2add == '' ) return ;
			me.reloadItems ( [ me.item2add ] , function () {
				// Sanity check
				var i = me.getItem ( me.item2add ) ;
				var types = i.getItemValues ( wdid.p_type ) ;
//				console.log ( types ) ;
				if ( types.length == 0 || -1 == $.inArray ( types[0] , wdid.q_questions ) ) {
					alert ( 'Sorry, that is not a question item' ) ;
					return ;
				}
				
				// Now add it
				me.max_question_id++ ;
				var question = { q:me.item2add , num:me.max_question_id , points:1 } ;
				me.questions[question.num] = question ;
				me.sort_order.push ( question.num ) ;
				me.actions.push ( { type:'add_question' , question:me.questions[question.num] } ) ;
				me.initProgress() ;
			} ) ;
		} ,
		wasChanged : function () {
			var me = this ;
			if ( me.sort_order.join() != me.original_sort_order ) return true ;
			if ( me.actions.length > 0 ) return true ;
			if ( me.quiz_label.text != me.quiz_item.getLabel()[0] ) return true ;
			if ( me.quiz_desc.text != me.quiz_item.getDescription()[0] ) return true ;
			return false ;
		} ,
		removeCurrentQuestion : function () {
			var me = this ;
			var qu = me.sort_order[me.current_question] ;
			me.actions.push ( { type:'remove_question' , question:me.questions[qu] } ) ;
			me.sort_order.splice ( me.current_question , 1 ) ;
			if ( me.current_question > 0 && me.current_question >= me.sort_order.length ) me.current_question-- ;
			me.initProgress() ;
		} ,
		saveChanges : function () {
			var me = this ;
			me.loaded = false ;

			if ( me.quiz_label.text != me.quiz_item.getLabel()[0] ) {
				var lang = me.quiz_item.getLabel()[1] ;
				var labels = {} ;
				labels[lang] = { language:lang , value:me.quiz_label.text } ;
				var params = {
					action:'wbeditentity',
					id:me.q ,
					data:JSON.stringify({labels}) ,
				} ;
				me.quiz_label.text = me.quiz_item.getLabel()[0] ; // Hack for next run!
				return me.runWikibaseEdit ( params , function ( d ) { me.saveChanges() } ) ;
			}
			
			if ( me.quiz_desc.text != me.quiz_item.getDescription()[0] ) {
				var lang = me.quiz_item.getDescription()[1] ;
				var descriptions = {} ;
				descriptions[lang] = { language:lang , value:me.quiz_desc.text } ;
				var params = {
					action:'wbeditentity',
					id:me.q ,
					data:JSON.stringify({descriptions}) ,
				} ;
				me.quiz_desc.text = me.quiz_item.getDescription()[0] ; // Hack for next run!
				return me.runWikibaseEdit ( params , function ( d ) { me.saveChanges() } ) ;
			}
			
			// Do actions first
			if ( me.actions.length > 0 ) {
				var a = me.actions.shift() ;
				if ( a.type == 'add_question' ) {
					var data = me.newClaimItem ( {
						property:wdid.p_part ,
						id:a.question.q ,
						qualifiers:[
							me.newClaimQuantity({amount:a.question.num,property:wdid.p_serial_number}).mainsnak ,
							me.newClaimQuantity({amount:a.question.points,property:wdid.p_points}).mainsnak ,
						]
					} ) ;
					var params = {
						action:'wbeditentity',
						id:me.q ,
						data:JSON.stringify({claims:[data]}) ,
					} ;
					me.runWikibaseEdit ( params , function ( d ) {
						me.saveChanges() ; // Next edit
					} ) ;
				} else if ( a.type == 'remove_question' ) {
					var params = {
						action:'wbremoveclaims',
						claim:a.question.statement.id
					} ;
					me.runWikibaseEdit ( params , function ( d ) {
						console.log ( d ) ;
						me.saveChanges() ; // Next edit
					} ) ;
				} else if ( a.type == 'change_points' ) {
					var s = a.question.statement ;
					var params = {
						action:'wbsetqualifier' ,
						property:wdid.p_points ,
						snaktype:'value' ,
						value:JSON.stringify({amount:''+a.question.points,unit:'1'}) ,
						claim:s.id ,
					} ;
					if ( typeof s.qualifiers != 'undefined' && typeof s.qualifiers[wdid.p_points] != 'undefined' ) { // Modify existing qualifier
						params.snakhash = s.qualifiers[wdid.p_points][0].hash ;
					}
					me.runWikibaseEdit ( params , function ( d ) {
						me.saveChanges() ; // Next edit
					} ) ;
				}
				return ;
			}
			
			function finish () {
				me.reloadItems ( [ me.q ] , function () {
					me.init() ;
/*					me.loadQuiz ( function () {
						me.quiz_label = { text:me.quiz_item.getLabel()[0] } ;
						me.quiz_desc = { text:me.quiz_item.getDescription()[0] } ;
					} ) ;*/
				} ) ;
			}

			// No more actions? Save sort order!
			var so = me.sort_order.join(',') ;
			if ( so != me.original_sort_order ) { // Sort order changed
				var statements = me.quiz.getStatements ( wdid.p_sort_order ) ;
				var params ;
				if ( statements.length > 0 ) { // Edit statement
					params = {
						action:'wbsetclaimvalue',
						claim:statements[0].id,
						property:wdid.p_sort_order ,
						snaktype:'value' ,
						value:JSON.stringify(so) ,
					} ;
				} else { // Create statement
					var data = me.newClaimString ( { property:wdid.p_sort_order , value:so } ) ;
					
					params = {
						action:'wbcreateclaim',
						entity:me.q,
						snaktype:'value',
						property:wdid.p_sort_order,
						value:JSON.stringify(so)
					}
				}

				me.runWikibaseEdit ( params , function ( d ) {
					if ( d.success ) {
						me.original_sort_order = so ;
					} else {
						console.log ( d ) ;
						alert ( d.error.info ) ;
					}
					finish() ;
				} ) ;
				
			} else {
				finish() ;
			}
		} ,
	} ,
	watch: {
		'$route' (to, from) { this.init() } ,
	} ,
}
</script>

<style>
div.design_quiz_question_header {
/*	background-color:white;*/
	width:100%;
	padding:2px;
	border-bottom:1px solid black;
}
div.design_quiz_question_wrapper {
	margin:3px;
	border:2px solid black;
	vertical-align:top;
	cursor:pointer;
}
div.design_quiz_question_container {
	display:grid;
	grid-template-columns: 1fr 1fr;
}
.zoom_half {
	zoom:0.5;

/*
-moz-transform: scale(0.5,0.5);
-ms-transform: scale(0.5,0.5);
-webkit-transform: scale(0.5,0.5);
-o-transform: scale(0.5,0.5);
transform: scale(0.5,0.5);
-moz-transform-origin: left top;
-ms-transform-origin: left top;
-webkit-transform-origin: left top;
transform-origin: left top;
*/
	
	/* Firefox does not support zoom yet. This is a hack-around, but it would require width and height at 200%, which breaks Chrome
	-moz-transform: scale(0.5);
	-moz-transform-origin: 0px 0px;*/
}

@media print {

div.design_quiz_question_container {
	display:block;
}

.quiz_description {
	font-size:13pt;
}

}

</style>