<template>
<div>
<div class="card-block">
<h4 class="card-title">Multiple choice question</h4>

<string-edit label='Label' placeholder='A name for the question' :value='question.label' noempty='1'></string-edit>
<string-edit label='Text' placeholder='The actual text of the question' :value='question.text' noempty='1'></string-edit>
<string-edit label='Hint' placeholder='A hint that can show in case of problems' :value='question.hint'></string-edit>

</div><div class="card-block">

<edit-answer v-for='(answer,num) in question.answers' :key='num' :answer='answer' :num='num' v-on:delete_answer='deleteAnswer'></edit-answer>

<button class='btn btn-sm btn-outline-success' @click.prevent='addAnswer'>Add answer</button>

</div>
</div>
</template>

<script>
import wdid from '../../config/wdid.js'
import wikibase_default_site from '../../config/wikibase_default_site.js'
import StringEdit from '../string-edit.vue'
import EditAnswer from './edit-answer.vue'

export default {
	props : [ 'question' ] ,
	components : { 'string-edit':StringEdit , 'edit-answer':EditAnswer } ,
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
		}
	} ,
}
</script>

<style>
</style>
