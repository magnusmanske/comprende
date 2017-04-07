<template>
<div class='card'>
<h3 class="card-header"><i18n k='label image question'/></h3>

<div class="card-block">
	<slot name="warnings"></slot>

	<string-edit label='Label' placeholder='A name for the question' :value='question.label' noempty='1'></string-edit>
	<string-edit label='Text' placeholder='Text accompanying the question' :value='question.text'</string-edit>
	<string-edit label='Hint' placeholder='A hint that can show in case of problems' :value='question.hint'></string-edit>
</div>

<div class="card-block">
	<edit-transclusions :question='question'></edit-transclusions>
</div>

<div class="card-block">
	<div>
		<div class='form-group row'>
			<label class='col-sm-2 col-form-label'><i18n k='image search query'></i18n></label>
			<div class='col-sm-5'><input type='text' class='form-control eqli_image_query' v-model='image_query' @keyup.enter='onImageQueryChange' /></div>
			<div class='col-sm-4'><button class='btn' @click='onImageQueryChange'><i18n k='search commons'/></button></div>
		</div>
		<div class='form-group row'>
			<label class='col-sm-2 col-form-label'><i18n k='image name'></i18n></label>
			<div class='col-sm-5'><input type='text' class='form-control' v-model='question.image' @keyup.enter='onImageQueryChange' /></div>
			<div class='col-sm-4'>
				<button class='btn' @click='onImageChange'><i18n k='use this file'/></button>
				<a v-if='valid_image' target='_blank' class='external' :href='"https://commons.wikimedia.org/wiki/File:"+encodeURIComponent(question.image)'><i18n k='View file on Commons'/></a>
			</div>
		</div>
	</div>

	<div v-if='valid_image'>

		<image-with-labels :image='question.image' :width='width' :height='width' :answers='question.answers' :editing='1' :crop='crop_param' v-on:image_clicked='onImageClicked'></image-with-labels>
		<div class='eqli_image_note'><i18n k='Click on the image to create an answer'/></div>

		<div>
			<i18n k='crop parameters'></i18n>
			<input type='number' v-model='question.crop[0]' class='form-input col-sm-1' />/<input type='number' v-model='question.crop[1]' class='form-input col-sm-1' />
			-
			<input type='number' v-model='question.crop[2]' class='form-input col-sm-1' />/<input type='number' v-model='question.crop[3]' class='form-input col-sm-1' />
		</div>

		<div class='eqli_answer_container'>
			<h4 class='card-title'><i18n k='answers'/></h4>
			<edit-answer v-for='(answer,num) in question.answers' :key='num' :answer='answer' :num='num' v-on:delete_answer='deleteAnswer'></edit-answer>
		</div>

	</div>

	<div v-else> <!-- No valid image-->
		<div v-for='(i,num) in image_candidates' :key='i.filename' class='eqil_thumbnail' :style='{width:thumb_size+"px",height:thumb_size+"px","max-height":thumb_size+"px"}'>
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
import edit_transclusions from './edit-transclusions.vue'

export default {
	props : [ 'question' ] ,
	components : {
		'string-edit':StringEdit ,
		'edit-answer':EditAnswer ,
		'image-with-labels':ImageWithLabels ,
		'edit-transclusions':edit_transclusions,
		i18n ,
	} ,
	data : function () { return { image_query:'' , image_candidates:[] , valid_image:false , width:800 , thumb_size:120 , num:1 } } ,
	mounted : function () {
		$(this.$el).find('input.eqli_image_query').focus() ;
	} ,
	methods : {
		onImageClicked : function ( p ) {
			this.addAnswer ( p ) ;
		} ,
		addAnswer : function ( p ) {
			var me = this ;
			me.question.answers.push ( {
				num : me.num++ ,
				fraction : { text:'0' } ,
				text : { text:'' , item:'' , language:wikibase_default_site.language } ,
				feedback : { text:'' , item:'' , language:wikibase_default_site.language } ,
				type : wdid.p_text_answer ,
				position : p
			} ) ;
		} ,
		deleteAnswer : function ( num ) {
			this.question.answers.splice ( num , 1 ) ;
		} ,
		onImageChange : function () {
			// TODO check via API if it's really a file on Commons
			this.crop_param = '' ;
			this.question.answers = [] ;
			this.valid_image = true ;
			this.num = 1 ;
		} ,
		onImageQueryChange : function () {
			var me = this ;
			me.valid_image = false ;
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
			this.question.image = this.image_candidates[num].filename ;
			this.onImageChange() ;
		} ,
	} ,
	watch : {
		'question.crop' : {
			handler : function () {
				this.crop_param = (this.question.crop[0]*100)+','+(this.question.crop[1]*100)+','+(this.question.crop[2]*100)+','+(this.question.crop[3]*100) ;
			} ,
			deep:1
		} ,
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
