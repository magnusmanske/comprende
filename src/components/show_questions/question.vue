<template>
<div class='question_container'>
<div v-if='loaded' class='question'>

<div style='margin-bottom:10px;'>
<question-label-image v-if='type==wdid.q_label_item_question' :q='q' v-on:ready_to_check='readyCheckChoices' :options='options' :thumbnail='thumbnail'></question-label-image>
<question-multiple-choice v-if='type==wdid.q_multiple_choice_question' :q='q' v-on:ready_to_check='readyCheckChoices' :options='options' :thumbnail='thumbnail'></question-multiple-choice>
<div v-else><i18n k='Unknown question type'></i18n>: {{type}}</div>
</div>

<div v-if='!thumbnail && can_check_choices && !auto_show_choices' class='bottom_buttons'>
<button class='btn btn-secondary' @click.prevent='checkChoices'><i18n k='Check your choices'/></button>
</div>

<div v-if='!thumbnail'><div class='license_note'>©<router-link to='/'><i18n k='Comprende'></i18n></router-link>, <a href='https://creativecommons.org/publicdomain/zero/1.0/' target='_blank' class='external'><i18n k='CC-ZERO'/></a></div></div>

</div>
<div v-else><i><i18n k='loading'/></i></div>
</div>
</template>

<script>
import i18n from '../i18n.vue'
import QuestionMultipleChoice from './question-multiple-choice.vue' ;
import { wdid } from '../../config.js'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' , 'auto_show_choices' , 'thumbnail' ] ,
	data : function () { return { type:'' , loaded:false , can_check_choices:false , options : {} , wdid:wdid } } ,
	created : function () { this.loadQuestion() } ,
	components : { 'question-multiple-choice':QuestionMultipleChoice , i18n } ,
	methods : {
		readyCheckChoices : function () {
			this.can_check_choices = true ;
			if ( this.auto_show_choices ) this.checkChoices() ;
		} ,
		checkChoices : function () {
			this.options.show_choices = true ;
		} ,
		loadQuestion () {
			var me = this ;
			me.loaded = false ;
			me.options = { show_choices:false } ;
			me.loadItems ( [me.q] , function () {
				var i = me.getItem(me.q) ;
				me.type = 'none set' ;
				var types = i.getItemValues ( wdid.p_type ) ;
				if ( types.length > 0 ) me.type = types[0] ;
				me.loaded = true ;
			} ) ;
		}
	} ,
	watch : {
		q : function () { this.loadQuestion() }
	}
}
</script>

<style>
</style>
