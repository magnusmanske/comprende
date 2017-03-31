<template>
<div>
<nav-header></nav-header>
<h1><i18n k='quiz'/></h1>

<h3>Questions</h3>
<div style='display:grid;grid-template-columns: 1fr 1fr;'>

<div v-for='(question,num) in questions_compact' class='design_quiz_question_wrapper'>
	<div class='design_quiz_question_float'>
		#{{question.num}}; {{question.points}} points
	</div>
	<question style='zoom:0.5;' :q='question.q' thumbnail='1'></question>
</div>

</div>

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
	data : function () { return { questions_compact:[] } } ,
	mixins : [ quiz_mixin ] ,
	created : function () {
		var me = this ;
		this.loadQuiz ( me.quizIsLoaded ) ;
	} ,
	mounted : function () {
		var me = this ;
		$(me.$el).find('a').addClass('disabled') ;
	} ,
	methods : {
		quizIsLoaded : function () {
			var me = this ;
			me.questions_compact = [] ;
			$.each ( me.questions , function ( k , v ) {
				if ( typeof v == 'undefined' ) return ;
				me.questions_compact.push ( v ) ;
			} ) ;
		} ,
	} 

}
</script>

<style>
div.design_quiz_question_float {
	background-color:white;
	width:100%;
	padding:2px;
	border-bottom:1px solid black;
}
div.design_quiz_question_wrapper {
	margin:3px;
	border:2px solid black;
	vertical-align:top;
}
</style>