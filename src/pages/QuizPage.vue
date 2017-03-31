<template id='quiz-page-template'>
<div>
<h1>Quiz</h1>

<div v-if='quiz_is_done'>
	<div><i18n k='quiz completed'/></div>
	<div><i18n k='current points in quiz' :params='[progress.points,progress.total_points]'></i18n></div>
	<div><i18n k='questions correctly' :params='[progress.correct]'></i18n><i18n k='questions failed' :params='[progress.failed]'></i18n></div>
	<div>
		<div class='progress'><div class="progress-bar bg-success" role="progressbar" :style='"width:"+(100*progress.points/progress.total_points)+"%"' /></div>
		<div class='progress'><div class="progress-bar bg-danger" role="progressbar" :style='"width:"+(100*progress.failed_points/progress.total_points)+"%"' /></div>
	</div>
</div>

<div v-else-if='loaded'>

<div class='question_wrapper'>
	<h2 class="card-title">
	<div style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this quiz' target='_blank'>{{q}}</a>]</div>
	{{quiz.getLabel()[0]}}
	</h2>
	<p class="card-title">{{quiz.getDescription()[0]}}</p>
	<question :q='questions[current_question].q' auto_show_choices='1'></question>

	<div style='margin-bottom:5px;'>
		<div v-if='progress.total' class='progress'>
			<div class="progress-bar bg-success" role="progressbar" :style='"width:"+(100*progress.points/progress.total_points)+"%"' />
			<div class="progress-bar bg-danger" role="progressbar" :style='"width:"+(100*progress.failed_points/progress.total_points)+"%"' />
		</div>
		<div>
			<i18n k='total questions in quiz' :params='[progress.total]'></i18n>
			<i18n k='current points in quiz' :params='[progress.points,progress.total_points]'></i18n>
			<i18n k='questions left in quiz' :params='[progress.questions_left]'></i18n>
		</div>
		<div><i18n k='questions correctly' :params='[progress.correct]'></i18n><i18n k='questions failed' :params='[progress.failed]'></i18n></div>
	</div>
</div><!-- question-wrapper -->

<div v-if='show_next_question_button' class='bottom_buttons'>
<button :class='{btn:true , "btn-outline-success":last_answer_correct , "btn-outline-secondary":(!last_answer_correct) }' @click.prevent='showNextQuestion'><i18n k='Next question'/></button>
</div>

</div>

<div v-else><i>Loading quiz...</i></div>

</div>
</template>

<script>

import question_bus from '../components/show_questions/question_bus.vue'
import question from '../components/show_questions/question.vue'
import i18n from '../components/i18n.vue'
import { wdid } from '../config.js'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
/*
import Vue from 'vue'
import VueGesture from 'vue-gesture'
Vue.use(VueGesture)
*/
export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' ] ,
	data : function () { return { questions:[] , loaded:false , quiz:{} , show_next_question_button:false , last_answer_correct:false , current_question:0 , quiz_is_done:false , progress:{} } } ,
	created : function () {
		question_bus.$on ( 'answered' , this.wasAnswered ) ;
		this.loadQuiz() ;
	} ,
	components : { question , i18n } ,
	methods : {
		onSwipeLeft : function () {
			if ( !this.show_next_question_button ) return ;
			this.showNextQuestion() ;
		} ,
		canAdvance : function ( correctly ) {
			this.last_answer_correct = correctly ;
			this.show_next_question_button = true ;
		} ,
		wasAnswered : function ( correctly , percentage ) {
			var me = this ;
			var points = me.questions[me.current_question].points * percentage / 100 ;
			me.progress.points += points ;
			me.progress.failed_points += me.questions[me.current_question].points - points ;
			if ( correctly ) me.progress.correct++ ;
			else me.progress.failed++ ;
			me.progress.questions_left-- ;
			me.canAdvance ( correctly ) ;
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
			me.progress = { total:0 , correct:0 , failed:0 , total_points:0 , points:0 , failed_points:0 , questions_left:0 } ;
			me.questions = [] ;
			me.current_question = 0 ;
			$.each ( statements , function ( dummy , s ) {
				var question = { q:s.mainsnak.datavalue.value.id , num:dummy+1000 , points:1 } ; // Defaults
				if ( typeof ((s.qualifiers||{})[wdid.p_serial_number]||[])[0] != 'undefined' ) {
					question.num = s.qualifiers[wdid.p_serial_number][0].datavalue.value.amount * 1 ;
				}
				if ( typeof ((s.qualifiers||{})[wdid.p_points]||[])[0] != 'undefined' ) {
					question.points = s.qualifiers[wdid.p_points][0].datavalue.value.amount * 1 ;
				}
				if ( question.num < me.current_question || me.current_question == 0 ) me.current_question = question.num ; // Lowest number
				to_load.push ( question.q ) ;
				me.questions[question.num] = question ;
				me.progress.total++ ;
				me.progress.questions_left++ ;
				me.progress.total_points += question.points ;
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
@media screen and (orientation:portrait) {

div.question_wrapper {
	margin-bottom:3rem;
}

}
</style>