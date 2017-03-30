<template>
<div class="form-group row">
<label class="col-2 col-form-label">
<div><i18n k='answer'/></div>
<button class='btn btn-sm btn-outline-danger' @click.prevent='deleteAnswer'><i18n k='delete answer'/></button>
</label>
<div class="col-10">

<div>
<div class="form-group row">
<label class="col-2 col-form-label"><i18n k='answer is'/></label>
<div class='col-10'>
<label><input type='radio' v-model='answer.type' :value='wdid.p_text_answer'> <i18n k='plain text or html'/></label>
<label><input type='radio' v-model='answer.type' :value='wdid.p_wd_answer'> <i18n k='wikidata item'/></label>
</div>
</div>
</div>

<string-edit v-if='answer.type==wdid.p_text_answer' label='Text' :value='answer.text' noempty='1' placeholder='The answer text'></string-edit>
<div v-else-if='answer.type==wdid.p_wd_answer'>
<div class="form-group row">
<label class="col-2 col-form-label"><i18n k='item'/></label>
<div class='col-10'>
<wikibase-predictive-type v-on:set_item='setItem' :site='wikidata_site' type='item' :text='answer.text.text' :item='answer.text.item'></wikibase-predictive-type>
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
import i18n from '../i18n.vue'
import WikibasePredictiveType from '../wikibase-predictive-type.vue'
import wikidata_site from '../../config/wikidata_site.js' ;

export default {
	props : [ 'answer' , 'num' ] ,
	components : { 'string-edit':StringEdit , 'wikibase-predictive-type':WikibasePredictiveType , i18n } ,
	data : function () { return { wdid , wikidata_site } } ,
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
