<template>
<div class="form-group row">
<label class="col-2 col-form-label">
Answer
<br/>
<button class='btn btn-sm btn-outline-danger' @click.prevent='deleteAnswer'>Delete</button>
</label>
<div class="col-10">

<div>
<div class="form-group row">
<label class="col-2 col-form-label">Answer is</label>
<div class='col-10'>
<label><input type='radio' v-model='answer.type' :value='wdid.p_text_answer'> Plain text/HTML</label>
<label><input type='radio' v-model='answer.type' :value='wdid.p_wd_answer'> Wikidata item</label>
</div>
</div>
</div>

<string-edit v-if='answer.type==wdid.p_text_answer' label='Text' :value='answer.text' noempty='1' placeholder='The answer text'></string-edit>
<div v-else-if='answer.type==wdid.p_wd_answer'>
<div class="form-group row">
<label class="col-2 col-form-label">Item</label>
<div class='col-10'>
<wikibase-predictive-type v-on:set_item='setItem' site='wikidata' type='item' :text='answer.text.text' :item='answer.text.item'></wikibase-predictive-type>
</div>
</div>
</div>
<div v-else>UNKNOWN ANSWER TYPE {{answer.type}}</div>


<string-edit label='Feedback' :value='answer.feedback' placeholder='Feedback text, to show after answering'></string-edit>
<string-edit label='Fraction' :value='answer.fraction' placeholder='An integer value from 0-100'></string-edit>
</div>
<!--<div><b>{{answer.text.text}} : {{answer.fraction.text}} / {{answer.fraction.type}}</b></div>-->
</div>
</template>

<script>
import wdid from '../../config/wdid.js'
import StringEdit from '../string-edit.vue'

export default {
	props : [ 'answer' , 'num' ] ,
	components : { 'string-edit':StringEdit } ,
	data : function () { return { wdid } } ,
	methods : {
		deleteAnswer : function () { this.$emit('delete_answer',this.num) } ,
		setItem : function ( item , text ) {
			this.answer.text.item = item ;
			this.answer.text.text = text ;
		}
	} ,
}
</script>

<style>
</style>
