<template>
<div>
<enter-questions :questions="questions"></enter-questions>
</div>
</template>

<script>
import EnterQuestions from '../components/edit_questions/enter-questions.vue'

export default {
	components : { 'enter-questions':EnterQuestions } ,
	data : function () { return { questions:[] } } ,
}
</script>

<style>
</style>
