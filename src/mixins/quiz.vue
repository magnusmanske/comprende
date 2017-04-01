<template>
</template>

<script>
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
import { wdid } from '../config.js'

export default {
	data : function () { return { questions:[] , loaded:false , progress:{} , wdid , current_question:0 , not_a_quiz:false } } ,
	mixins : [ wikibaseAPImixin ] ,
	methods : {
		initProgress ( statements ) {
			var me = this ;
			me.progress = { total:0 , correct:0 , failed:0 , total_points:0 , points:0 , failed_points:0 , questions_left:0 , points_required:0 } ;
			me.current_question = 0 ;
			$.each ( me.questions , function ( dummy , question ) {
				if ( typeof question == 'undefined' ) return ;
				var s = question.statement ;
				if ( typeof ((s.qualifiers||{})[wdid.p_points]||[])[0] != 'undefined' ) {
					question.points = s.qualifiers[wdid.p_points][0].datavalue.value.amount * 1 ;
				}
				if ( question.num < me.current_question || me.current_question == 0 ) me.current_question = question.num ; // Lowest number
				me.progress.total++ ;
				me.progress.questions_left++ ;
				me.progress.total_points += question.points ;
			} ) ;
			
			statements = me.quiz.getStatements ( wdid.p_points_required ) ;
			$.each ( statements , function ( k , v ) { me.progress.points_required = v.mainsnak.datavalue.value.amount*1 } ) ;
		} ,
		loadQuestions : function ( callback ) {
			var me = this ;
			me.quiz = me.getItem ( me.q ) ;
			me.questions = [] ;
			
			// Is it a quiz?
			var types = me.quiz.getItemValues ( wdid.p_type ) ;
			me.not_a_quiz = true ;
			$.each ( types , function ( dummy , q ) {
				if ( q == wdid.q_quiz ) me.not_a_quiz = false ;
			} ) ;
			if ( me.not_a_quiz ) return ;
			
			// Get questions
			var statements = me.quiz.getStatements ( wdid.p_part ) ;
			var to_load = [] ;
			$.each ( statements , function ( dummy , s ) {
				var question = { statement:s , q:s.mainsnak.datavalue.value.id , num:dummy+1000 , points:1 } ; // Defaults
				if ( typeof ((s.qualifiers||{})[wdid.p_serial_number]||[])[0] != 'undefined' ) {
					question.num = s.qualifiers[wdid.p_serial_number][0].datavalue.value.amount * 1 ;
				}
				me.questions[question.num] = question ;
				to_load.push ( question.q ) ;
			} ) ;
			
			me.initProgress ( statements ) ;
			
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