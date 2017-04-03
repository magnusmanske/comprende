<template id='quiz-page-template'>
<div>
<nav-header></nav-header>
<h1><i18n k='quiz'/></h1>

<div v-if='not_a_quiz' class='btn-outline-danger'><i18n k='this is not a quiz'/></div>
<div v-else-if='(questions.length==0||typeof q=="undefined")'><i18n k='this quiz is empty'/></div>

<div v-else-if='isQuizDone()'>
	<h2 class="card-title">
	<div style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this quiz' target='_blank'>{{q}}</a>]</div>
	{{quiz.getLabel()[0]}}
	</h2>
	<div><i18n k='quiz completed'/></div>
	<div><i18n k='questions correctly failed' :params='[progress.correct,progress.failed]'></i18n></div>
	<div><i18n k='current points in quiz' :params='[progress.points,progress.total_points]'></i18n></div>
	<div v-if='progress.points_required>0'><i18n k='points required for quiz' :params='[progress.points_required]'></i18n></div>
	<div>
		<div class='progress'><div class="progress-bar bg-success" role="progressbar" :style='"width:"+(100*progress.points/progress.total_points)+"%"' /></div>
		<div class='progress'><div class="progress-bar bg-danger" role="progressbar" :style='"width:"+(100*progress.failed_points/progress.total_points)+"%"' /></div>
	</div>
	<div v-if='progress.points_required>0' class='quiz_result'>
		<div v-if='progress.points>=progress.points_required'><i18n class='btn-outline-success' k='passed quiz'/></div>
		<div v-else><i18n class='btn-outline-danger' k='failed quiz'/></div>
	</div>
</div>

<div v-else-if='loaded'>

<div class='question_wrapper'>
	<h2 class="card-title">
	<div style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this quiz' target='_blank'>{{q}}</a>]</div>
	{{quiz.getLabel()[0]}}
	</h2>
	<p class="card-title">{{quiz.getDescription()[0]}}</p>
	<question :q='getCurrentQuestionQ' auto_show_choices='1'></question>

	<div style='margin-bottom:5px;'>
		<div v-if='progress.total' class='progress'>
			<div class="progress-bar bg-success" role="progressbar" :style='"width:"+(100*progress.points/progress.total_points)+"%"' />
			<div class="progress-bar bg-danger" role="progressbar" :style='"width:"+(100*progress.failed_points/progress.total_points)+"%"' />
		</div>
		<div>
			<i18n k='total questions in quiz' :params='[progress.total]'></i18n>
			<i18n k='questions left in quiz' :params='[progress.questions_left]'></i18n>
		</div>
		<div>
			<i18n k='questions correctly failed' :params='[progress.correct,progress.failed]'></i18n>
		</div>
		<div>
			<i18n k='current points in quiz' :params='[progress.points,progress.total_points]'></i18n>
			<i18n v-if='progress.points_required>0' k='points required for quiz' :params='[progress.points_required]'></i18n>
		</div>
	</div>
</div><!-- question-wrapper -->

<div v-if='show_next_question_button' class='bottom_buttons'>
<button :class='{btn:true , "btn-outline-success":last_answer_correct , "btn-outline-secondary":(!last_answer_correct) }' @click.prevent='showNextQuestion'>
<i18n v-if='progress.questions_left>0' k='Next question'/>
<i18n v-else k='show quiz results'/>
</button>
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
import NavHeader from '../components/nav-header.vue'
import quiz_mixin from '../mixins/quiz.vue'

/*
import Vue from 'vue'
import VueGesture from 'vue-gesture'
Vue.use(VueGesture)
*/

export default {
	mixins : [ wikibaseAPImixin , quiz_mixin ] ,
	props : [ 'q' ] ,
	data : function () { return { quiz:{} , show_next_question_button:false , last_answer_correct:false } } ,
	created : function () {
		var me = this ;
		$('body').swipe ( { // See https://github.com/mattbryson/TouchSwipe-Jquery-Plugin
			swipe : function ( event , direction ) {
				if ( direction == 'left' ) me.onSwipeLeft() ;
			}
		} ) ;

		question_bus.$on ( 'answered' , this.wasAnswered ) ;
		this.loadQuiz() ;
	} ,
	components : { question , i18n , 'nav-header':NavHeader } ,
	methods : {
		onSwipeLeft : function () {
			if ( !this.show_next_question_button ) return ;
			this.showNextQuestion() ;
		} ,
		canAdvance : function ( correctly ) {
			this.last_answer_correct = correctly ;
			this.show_next_question_button = true ;
		} ,
		showNextQuestion : function () {
			var me = this ;
			var nq = me.getNextQuestion() ;
		} ,
		wasAnswered : function ( correctly , percentage ) {
			var me = this ;
			var cq = me.getCurrentQuestion() ;
			var points = cq.points * percentage / 100 ;
			me.progress.points += points ;
			me.progress.failed_points += cq.points - points ;
			if ( correctly ) me.progress.correct++ ;
			else me.progress.failed++ ;
			me.progress.questions_left-- ;
			me.canAdvance ( correctly ) ;
		} ,
	} ,
}
</script>

<style>
div.quiz_result {
	font-size:14pt;
	text-align:center;
	margin-top:30px;
}

@media screen and (orientation:portrait) {

/* This makes the "Next question" button stick to the bottom of the mobile display */
div.question_wrapper {
	margin-bottom:3rem;
}

}
</style>