<template>
</template>

<script>
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
import { wdid } from '../config.js'

export default {
	data : function () { return { questions:[] , loaded:false , progress:{} , wdid , current_question:0 , not_a_quiz:false , sort_order:[] , original_sort_order:'' } } ,
	mixins : [ wikibaseAPImixin ] ,
	computed : {
		getCurrentQuestionQ : function () {
			var question = this.getCurrentQuestion() ;
			return question.q ;
		} ,
	} ,
	methods : {
		isQuizDone : function () {
			return this.current_question >= this.sort_order.length ;
		} ,
		getCurrentQuestion : function () {
			return this.getQuestion ( this.current_question ) ;
		} ,
		getQuestion : function ( sorted_id ) {
			return this.questions[this.sort_order[sorted_id]] ;
		} ,
		getNextQuestion : function () {
			var me = this ;
			me.current_question++ ;
			if ( me.isQuizDone() ) return ; // This is the end, my friend, the end
			return me.questions[me.sort_order[me.current_question]] ;
		} ,
		wasChanged : function () {
			var me = this ;
			if ( me.sort_order.join() != me.original_sort_order ) return true ;
			return false ;
		} ,
		reorderQuestion : function ( from , to ) {
			var me = this ;
			var so = [] ;
			$.each ( me.sort_order , function ( k , v ) { so[k] = v } ) ;
			var question_id = so.splice ( from , 1 ) [0] ;
			so.splice ( to , 0 , question_id ) ;
			me.sort_order = so ;
		} ,
		initProgress () {
			var me = this ;
			me.progress = { total:0 , correct:0 , failed:0 , total_points:0 , points:0 , failed_points:0 , questions_left:0 , points_required:0 } ;
			me.current_question = 0 ;
			$.each ( me.questions , function ( dummy , question ) {
				if ( typeof question == 'undefined' ) return ;
				var s = question.statement ;
				if ( typeof ((s.qualifiers||{})[wdid.p_points]||[])[0] != 'undefined' ) {
					question.points = s.qualifiers[wdid.p_points][0].datavalue.value.amount * 1 ;
				}
				me.progress.total++ ;
				me.progress.questions_left++ ;
				me.progress.total_points += question.points ;
			} ) ;
			
			var statements = me.quiz.getStatements ( wdid.p_points_required ) ;
			$.each ( statements , function ( k , v ) { me.progress.points_required = v.mainsnak.datavalue.value.amount*1 } ) ;
		} ,
		loadQuestions : function ( callback ) {
			var me = this ;
			me.quiz = me.getItem ( me.q ) ;
			me.questions = [] ;
			me.sort_order = [] ;
			
			// Is it a quiz?
			var types = me.quiz.getItemValues ( wdid.p_type ) ;
			me.not_a_quiz = true ;
			$.each ( types , function ( dummy , q ) {
				if ( q == wdid.q_quiz ) me.not_a_quiz = false ;
			} ) ;
			if ( me.not_a_quiz ) return ;
			
			// Get questions
			var so = [] ;
			var statements = me.quiz.getStatements ( wdid.p_part ) ;
			var to_load = [] ;
			$.each ( statements , function ( dummy , s ) {
				var question = { statement:s , q:s.mainsnak.datavalue.value.id , num:dummy+1000 , points:1 } ; // Defaults
				if ( typeof ((s.qualifiers||{})[wdid.p_serial_number]||[])[0] != 'undefined' ) {
					question.num = s.qualifiers[wdid.p_serial_number][0].datavalue.value.amount * 1 ;
				}
				so.push ( question.num ) ;
				me.questions[question.num] = question ;
				to_load.push ( question.q ) ;
			} ) ;
			
			var so_quiz = me.quiz.getStringValues ( wdid.p_sort_order ) ;
			if ( so_quiz.length > 0 ) {
				so = [] ;
				$.each ( so_quiz[0].split(',') , function ( k , v ) {
					so.push ( parseInt ( $.trim ( v ) ) ) ;
				} ) ;
			}
			me.sort_order = so ;

			me.original_sort_order = me.sort_order.join(',') ;
			
			me.initProgress () ;
			me.loadItems ( to_load , callback ) ;
		} ,
		loadQuiz : function ( callback ) {
			var me = this ;
			me.loaded = false ;
			me.loadItems ( [ me.q ] , function () {
				me.loadQuestions ( function () {
					if ( typeof callback != 'undefined' ) callback() ;
					me.loaded = true ;
				} ) ;
			} ) ;
		}
	} ,
}
</script>

<style>
</style>