<template>
<div>
<div class="card-block">
<h4 class="card-title"><i18n k='label image question'/></h4>

<string-edit label='Label' placeholder='A name for the question' :value='question.label' noempty='1'></string-edit>
<string-edit label='Text' placeholder='The actual text of the question' :value='question.text' noempty='1'></string-edit>
<string-edit label='Hint' placeholder='A hint that can show in case of problems' :value='question.hint'></string-edit>

</div><div class="card-block">

<!--<edit-answer v-for='(answer,num) in question.answers' :key='num' :answer='answer' :num='num' v-on:delete_answer='deleteAnswer'></edit-answer>-->
<div>
<div><i18n k='image search query'></i18n><input type='text' class='eqli_image_query' v-model='image_query' @keyup.prevent='onImageQueryChange' /></div>
<div><i18n k='image name'></i18n><input type='text' v-model='image' @keyup.prevent='onImageChange' /></div>
</div>

<div v-if='valid_image'>

<image-with-labels :image='image' :width='width' :height='width' :answers='answers'></image-with-labels>
<!-- v-on:answer-clicked='onNumberClicked' -->


<!--
<button class='btn btn-sm btn-outline-success' @click.prevent='addAnswer'>Add answer</button>
-->
</div>

<div v-else> <!-- No valid image-->
<div v-for='(i,num) in image_candidates' class='eqil_thumbnail' :style='{width:thumb_size+"px",height:thumb_size+"px","max-height":thumb_size+"px"}'>
<img :src='i.url' style='cursor:pointer' @click.prevent='onSelectImage(num)' />
</div>
</div>

</div>
</div>
</template>

<script>
import i18n from '../i18n.vue'
import { wdid , wikibase_default_site } from '../../config.js'
import StringEdit from '../string-edit.vue'
import EditAnswer from './edit-answer.vue'
import ImageWithLabels from '../show_questions/image-with-labels.vue'

export default {
	props : [ 'question' ] ,
	components : { 'string-edit':StringEdit , 'edit-answer':EditAnswer , i18n , 'image-with-labels':ImageWithLabels } ,
	data : function () { return { image:'' , image_query:'' , last_image_query:'' , image_candidates:[] , valid_image:false , width:800 , thumb_size:120 , answers:[] } } ,
	mounted : function () {
		$(this.$el).find('input.eqli_image_query').focus() ;
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
		onImageChange : function () {
			console.log ( this.image ) ;
		} ,
		onImageQueryChange : function () {
			var me = this ;
			if ( me.image_query == me.last_image_query ) return ;
			me.last_image_query = me.image_query ;
			$(me.$el).find('input.eqli_image_query').attr({disabled:'disabled'}) ;
			$.getJSON ( 'https://commons.wikimedia.org/w/api.php?callback=?' , {
				action:'query',
				format:'json',
				list:'search',
				srnamespace:'6',
				srlimit:50,
				srsearch:me.image_query
			} , function ( d ) {
				var candidates = [] ;
				$.each ( (d.query.search||[]) , function ( k , v ) {
					var o = { filename:v.title.replace(/^.+?:/,'') } ;
					o.url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(o.filename)+"?width="+me.thumb_size ;
					candidates.push ( o ) ;
				} ) ;
				me.image_candidates = candidates ;
			} )
			.always ( function () {
				$(me.$el).find('input.eqli_image_query').removeAttr('disabled').focus() ;
			} ) ;
		} ,
		onSelectImage : function ( num ) {
			this.image = this.image_candidates[num].filename ;
			this.valid_image = true ;
		} ,
	} ,
	watch : {
//		image : function () {
//		} ,
	}
}
</script>

<style>
div.eqil_thumbnail {
	overflow:hidden;
	text-align:center;
	display:inline-block;
	padding:2px;
	margin:4px;
	border:1px solid #DDD;
	border-radius:7px;
}
</style>
