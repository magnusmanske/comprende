<template>
<div>
<div v-if='loaded' class='question'>

<div style='margin-bottom:10px;'>
<question-label-image v-if='type==wdid.q_label_item_question' :q='q' v-on:ready_to_check='readyCheckChoices' :options='options'></question-label-image>
<question-multiple-choice v-if='type==wdid.q_multiple_choice_question' :q='q' v-on:ready_to_check='readyCheckChoices' :options='options'></question-multiple-choice>
<div v-else>Unknown question type: {{type}}</div>
</div>

<div v-if='can_check_choices && !auto_show_choices'>
<button class='btn btn-secondary' @click.prevent='checkChoices'>Check your choices</button>
</div>

</div>
<div v-else><i>Loading question...</i></div>
</div>
</template>

<script>
import QuestionMultipleChoice from './question-multiple-choice.vue' ;
import wdid from '../../config/wdid.js'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' , 'auto_show_choices' ] ,
	data : function () { return { type:'' , loaded:false , can_check_choices:false , options : {} , wdid:wdid } } ,
	created : function () { this.loadQuestion() } ,
	components : { 'question-multiple-choice':QuestionMultipleChoice } ,
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
