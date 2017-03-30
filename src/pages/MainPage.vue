<template id='MainPage'>
<div>
<ul>
<li><router-link to='/question/Q5'><i18n k='example_question'/></router-link></li>
<li><router-link to='/quiz/Q70'><i18n k='example_quiz'/></router-link></li>
<li><router-link to='/new/questions'>Create new questions</router-link> (with or without quiz)</li>
<li>Import questions from other formats
	<ul>
	<li><router-link to='/import/moodle_xml'>Moodle XML</router-link></li>
	</ul>
</li>
<li><a href='/comprende/'>The MediaWiki/WikiBase instance</a></li>
</ul>
</div>
</template>

<script>
import i18n from '../components/i18n.vue'

export default {
	name: 'MainPage',
	components: { i18n } ,
} ;
</script>

<style>
</style>