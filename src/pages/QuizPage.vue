<template id='quiz-page-template'>
<div>
<h1>Quiz</h1>

<div v-if='quiz_is_done'>
You successfully completed the quiz!
</div>

<div v-else-if='loaded'>
<h2 class="card-title">
<div style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this quiz' target='_blank'>{{q}}</a>]</div>
{{quiz.getLabel()[0]}}
</h2>
<p class="card-title">{{quiz.getDescription()[0]}}</p>
<question :q='questions[current_question].q' auto_show_choices='1'></question>

<div v-if='show_next_question_button' class='bottom_buttons'>
<button class='btn btn-outline-success' @click.prevent='showNextQuestion'>Next question</button>
</div>

</div>

<div v-else><i>Loading quiz...</i></div>

</div>
</template>

<script>
import question_bus from '../components/show_questions/question_bus.vue'
import question from '../components/show_questions/question.vue'
import { wdid } from '../config.js'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' ] ,
	data : function () { return { questions:[] , loaded:false , quiz:{} , show_next_question_button:false , current_question:0 , quiz_is_done:false } } ,
	created : function () {
//		question_bus = new Vue() ;
		question_bus.$on ( 'answered' , this.wasAnswered ) ;
		this.loadQuiz() ;
	} ,
	components : { question } ,
	methods : {
		wasAnswered : function ( correctly ) {
			if ( correctly ) this.show_next_question_button = true ;
		} ,
		showNextQuestion : function () {
			var me = this ;
			me.show_next_question_button = false ;
			for ( me.current_question++ ; me.current_question < me.questions.length ; me.current_question++ ) {
				if ( typeof me.questions[me.current_question] == 'undefined' ) continue ;
				break ;
			}
			if ( me.current_question == me.questions.length ) return me.quizIsDone() ;
		} ,
		quizIsDone : function () {
			this.quiz_is_done = true ;
		} ,
		loadQuestions : function ( callback ) {
			var me = this ;
			me.quiz = me.getItem ( me.q ) ;
			var statements = me.quiz.getStatements ( wdid.p_part ) ;
			var to_load = [] ;
			me.questions = [] ;
			me.current_question = 0 ;
			$.each ( statements , function ( dummy , s ) {
				var question = { q : s.mainsnak.datavalue.value.id , num : dummy+1000 } ; // Fallback number
				if ( typeof ((s.qualifiers||{})[wdid.p_serial_number]||{}) != 'undefined' ) {
					question.num = s.qualifiers[wdid.p_serial_number][0].datavalue.value.amount * 1 ;
				}
				if ( question.num < me.current_question || me.current_question == 0 ) me.current_question = question.num ; // Lowest number
				to_load.push ( question.q ) ;
				me.questions[question.num] = question ;
			} ) ;
			me.loadItems ( to_load , callback ) ;
		} ,
		loadQuiz : function () {
			var me = this ;
			me.loaded = false ;
			me.loadItems ( [ me.q ] , function () {
				me.loadQuestions ( function () {
					me.loaded = true ;
				} ) ;
			} ) ;
		}
	} ,
}
</script>

<style>
</style>