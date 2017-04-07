<template>
<div>
<h3 class="card-header"><i18n k='Multiple choice question'/></h3>

<div class="card-block">
	<slot name="warnings"></slot>

	<string-edit label='Label' placeholder='A name for the question' :value='question.label' noempty='1'></string-edit>
	<string-edit label='Text' placeholder='The actual text of the question' :value='question.text' noempty='1'></string-edit>
	<string-edit label='Hint' placeholder='A hint that can show in case of problems' :value='question.hint'></string-edit>
</div>

<div class="card-block">
	<edit-transclusions :question='question'></edit-transclusions>
</div>

<div class="card-block">
	<h4 class='card-title'><i18n k='answers'/></h4>
	<edit-answer v-for='(answer,num) in question.answers' :key='num' :answer='answer' :num='num' v-on:delete_answer='deleteAnswer'></edit-answer>
	<button class='btn btn-sm btn-outline-success' @click.prevent='addAnswer'><i18n k='Add answer'/></button>
</div>

</div>
</template>

<script>
import i18n from '../i18n.vue'
import { user , wdid , wikibase_default_site } from '../../config.js'
import StringEdit from '../string-edit.vue'
import EditAnswer from './edit-answer.vue'
import edit_transclusions from './edit-transclusions.vue'

export default {
	props : [ 'question' ] ,
	components : {
		'string-edit':StringEdit ,
		'edit-answer':EditAnswer ,
		'edit-transclusions':edit_transclusions,
		i18n ,
	} ,
	methods : {
		addAnswer : function () {
			this.question.answers.push ( {
				fraction : { text:'0' },
				text : { text:'' , item:'' , language:wikibase_default_site.language } ,
				feedback : { text:'' , item:'' , language:wikibase_default_site.language } ,
				type : wdid.p_text_answer ,
			} ) ;
		} ,
		deleteAnswer : function ( num ) {
			this.question.answers.splice ( num , 1 ) ;
		} ,
	} ,
}
</script>

<style>
</style>
