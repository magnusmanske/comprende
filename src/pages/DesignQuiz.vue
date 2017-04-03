<template>
<div>
<nav-header></nav-header>
<h1><i18n k='quiz'/></h1>

<h3>Questions</h3>
<div v-if='loaded' class='design_quiz_question_container'>

<div v-for='(question_id,dummy) in sort_order' :key='question_id' class='design_quiz_question_wrapper'>
	<div class='design_quiz_question_header'>
		<i18n k='quetion_counts' :params='[questions[question_id].points]'></i18n>
	</div>
	<question style='zoom:0.5;' :q='questions[question_id].q' thumbnail='1'></question>
</div>

</div>

<div v-else><i18n k='loading'/></div>

</div>
</template>

<script>
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