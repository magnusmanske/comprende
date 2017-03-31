<template>
<div>
<nav-header></nav-header>

<div v-if='stage==1'>
<div class="card"><div class="card-block">
<h2 class="card-title"><i18n k='import moodle title'/></h2>
<textarea id='moodle_xml' style='width:100%;font-size:10pt;font-family:monospace' rows='15' placeholder='Paste Moodle XML here'></textarea>
<button class='btn btn-outline-primary' @click.prevent='doneStage1'><i18n k='Convert XML'/></button>
</div></div>
</div>

<div v-if='stage==2'>
<enter-questions :questions="questions"></enter-questions>
</div>

</div>
</template>


<script>
import i18n from '../components/i18n.vue'
import newQuestionsMixin from '../mixins/newQuestionsMixin.vue'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
import EnterQuestions from '../components/edit_questions/enter-questions.vue'
import NavHeader from '../components/nav-header.vue'

export default {
	mixins : [ wikibaseAPImixin , newQuestionsMixin ] ,
	data : function () { return { stage:1 , questions:[] } } ,
	mounted : function () { $('#moodle_xml').focus() } ,
	components : { 'enter-questions':EnterQuestions , i18n , 'nav-header':NavHeader } ,
	methods : {
		xml2text : function ( v , is_label ) {
			var me = this ;
			var ret = {
				text : $.trim ( $(v).text() ) ,
				language : me.getCurrentLanguage() ,
				item : '' ,
			} ;
			ret.text = ret.text.replace ( /[ \t\n\r]+/g , ' ' ) ; // Spaces
//			ret.text = ret.text.replace ( /<\/{0,1}\s*(p|br|span)\s*\/{0,1}>/ig , '' ) ; // HTML tag filter, just some tags
			ret.text = ret.text.replace ( /<.*?>/g , '' ) ; // HTML tag filter, all tags
			ret.text = ret.text.substr(0,is_label?248:395) ; // Wikibase string length limit
			ret.text = $.trim ( ret.text ) ;
			var format = $(v).attr('format') ;
			if ( typeof format != 'undefined' && format != '' ) ret.format = format ;
			return ret ;
		} ,
		parseMultichoiceQuestion : function ( x ) {
			var me = this ;
			var $x = $(x) ;
			var question = me.getNewQuestion ( wdid.q_multiple_choice_question , {
				label : me.xml2text($x.find('name'),true) ,
				text : me.xml2text($x.find('questiontext'),true) ,
				hint : me.xml2text($x.find('generalfeedback'))
			} ) ;
			
			$x.find('answer').each ( function ( k , v ) {
				v = $(v) ;
				var answer = {
					fraction : { text:''+parseInt(v.attr('fraction')) },
					text : me.xml2text(v.find('> text')) ,
					feedback : me.xml2text(v.find('> feedback')) ,
					type : wdid.p_text_answer ,
				} ;
				question.answers.push ( answer ) ;
			} ) ;
			
			me.questions.push ( question ) ;
		} ,
		doneStage1 : function () {
			var me = this ;
			
			var $x = $($.parseXML ( $('#moodle_xml').val() )) ;
			// TODO quiz?
			$x.find('question').each ( function ( num , v ) {
				v = $(v) ;
				if ( v.attr('type') == 'category' ) {
					// Skip
				} else if ( v.attr('type') == 'multichoice' ) {
					me.parseMultichoiceQuestion ( v ) ;
				} else if ( v.attr('type') == 'truefalse' ) {
					me.parseMultichoiceQuestion ( v ) ;
				} else {
					console.log ( 'Unknown question type ' + v.attr('type') ) ;
				}
				
			} ) ;
			
//			console.log ( me.questions ) ;
			
			me.stage = 2 ;
		} ,
	} ,
}
</script>

<style>
</style>
