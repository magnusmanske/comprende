<template>
<question :q='q'></question>
</template>


<script>
import question from '../components/show_questions/question.vue'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props : [ 'q' ] ,
	components : { question:question } ,
	data : function () { return { type:'' , loading:true } } ,
}
</script>

<style>
</style>