<template>
<div v-if='loaded' class="card">
	<div class="card-block">
		<h4 class="card-title">
			<div v-if='!thumbnail' style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this question' target='_blank'>{{q}}</a>]</div>
			{{title}}
		</h4>
		<h6 class="card-subtitle mb-2 text-muted">{{subtitle}}</h6>
		<question-intro :q='q' :detailed='1'></question-intro>
	</div>
</div>
</template>


<script>
import { wdid , wikidata_site , user } from '../../config.js'
import question_bus from './question_bus.vue'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'
import QuestionIntro from './question-intro.vue'
import i18n from '../i18n.vue'
import QuestionMixin from '../../mixins/QuestionMixin.vue'

export default {
	mixins : [ wikibaseAPImixin , QuestionMixin ] ,
	props: [ 'q' , 'options' , 'thumbnail' ] ,
	data : function () { return { i:{} , loaded:false , num_selected:0 , num_required:0 , has_been_answered:false , user } } ,
	created : function () { this.loadQuestion () } ,
	components : { 'question-intro':QuestionIntro , i18n } ,
	methods : {
		loadQuestion : function () {
			var me = this ;
			me.has_been_answered = false ;
			me.num_selected = 0 ;
			me.loaded = false ;
			me.answers = [] ;
			me.i = me.getItem ( me.q ) ;
			me.setTitle() ;
			me.has_been_answered = true ; // Let answer only once
				me.$emit ( 'ready_to_check' ) ;
			question_bus.$emit ( 'answered' , 0 , 0 ) ;
			me.loaded = true ;
		}
	} ,
	watch : {
		q : function () { this.loadQuestion() } ,
		'user.settings' : { handler : function () { this.setTitle() } , deep : true } ,
	}
}
</script>

<style>
</style>
