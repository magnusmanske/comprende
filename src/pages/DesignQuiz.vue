<template>
<div>
<nav-header></nav-header>
<h1>
<div style='float:right;font-size:10pt;'>[<a :href='"./index.php?title=Item:"+q' target='_blank'>{{q}}</a>]</div>
<i18n k='quiz'/>
</h1>

<div v-if='loaded'>

	<p v-if='wasChanged()'>
		<button class='btn btn-outline-primary' @click.prevent='saveChanges'><i18n k='save changes'/></button>
	</p>

	<p><i18n k='total points in quiz' :params='[progress.total_points]'></i18n> <i18n k='total questions in quiz' :params='[progress.total]'></i18n></p>

	<h3>Questions</h3>
	<div class='design_quiz_question_container'>

		<div v-for='(question_id,dummy) in sort_order' :key='question_id' class='design_quiz_question_wrapper'>
			<div class='design_quiz_question_header'>
				<i18n k='quetion_counts' :params='[questions[question_id].points]'></i18n>
			</div>
			<question style='zoom:0.5;' :q='questions[question_id].q' thumbnail='1'></question>
		</div>

	</div>
</div>

<div v-else><i18n k='loading'/></div>

</div>
</template>

<script>
import { wdid , wikibase_default_site } from '../config.js'
import i18n from '../components/i18n.vue'
import NavHeader from '../components/nav-header.vue'
import question from '../components/show_questions/question.vue'
import quiz_mixin from '../mixins/quiz.vue'

export default {
	props : [ 'q' ] ,
	components : { question , i18n , 'nav-header':NavHeader } ,
	data : function () { return {} } ,
	mixins : [ quiz_mixin ] ,
	created : function () {
		var me = this ;
		this.loadQuiz () ;
	} ,
	updated : function () {
		var me = this ;
		var container = $(me.$el).find('div.design_quiz_question_container') ;
		Sortable.create ( container.get(0) , {
			draggable : '.design_quiz_question_wrapper' ,
			onUpdate : function ( ev ) {
				me.reorderQuestion ( ev.oldIndex , ev.newIndex ) ;
			}
		} ) ;
	} ,
	methods : {
		saveChanges : function () {
			var me = this ;
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

				me.getToken ( function ( token ) {
					params.token = token ;
					params.format = 'json' ;
					$.post ( wikibase_default_site.api , params , function ( d ) {
						if ( d.success ) {
							me.original_sort_order = so ;
						} else {
							console.log ( d ) ;
							alert ( d.error.info ) ;
						}
					} ) ;
				} ) ;
				
			}
		} ,
	} ,
}
</script>

<style>
div.design_quiz_question_header {
	background-color:white;
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
</style>