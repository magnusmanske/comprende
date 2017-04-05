<template>
<div style='position:relative;overflow:hidden;'>
<div v-if='img_loaded' style='height:0px;position:relative;'>
	<div class='image_with_labels_answer image_with_labels_toggler' @click.prevent='show_numbers=!show_numbers'>{{show_numbers?'○':'●'}}</div>
	<div v-if='show_numbers' v-for='(answer,answer_id) in answers' :style='getAnswerStyle(answer)' class='image_with_labels_answer' @click.prevent='$emit("answer-clicked",answer_id)'>{{answer.num}}</div>
</div>
<div v-else><i><i18n k='loading'/></i></div>
<div :style='{width:w+"px","max-height":h+"px"}' class='image_with_labels_container'>
<img @load='imageLoaded' class='card-img-bottom image_with_labels' :src='url' />
</div>
</div>
</template>

<script>
import { wdid , wikidata_site , user } from '../../config.js'
import i18n from '../i18n.vue'

export default {
	props : [ 'image' , 'crop' , 'width' , 'height' , 'answers' ] ,
	data : function () { return { cropped:{} , url:'' , w:0 , h:0 , img_loaded:false , show_numbers:true } } ,
	components : { i18n } ,
	created : function () { this.init() } ,
	methods : {
		init : function () {
			var me = this ;
			me.w = (me.width||600) ;
			me.h = (me.height||me.width) ;
			me.img_loaded = false ;
			me.iw = 0 ;
			me.ih = 0 ;
			me.cropped = {x1:0,y1:0,x2:10000,y2:10000} ;
			var crop_parts = (me.crop||'').split(',') ;
			if ( crop_parts.length == 4 ) me.cropped = {x1:crop_parts[0]*1,y1:crop_parts[1]*1,x2:crop_parts[2]*1,y2:crop_parts[3]*1} ;
			me.url = "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+encodeURIComponent(me.image)+"?width="+me.width ;
		} ,
		getImg : function () {
			return $($(this.$el).find('img.image_with_labels').get(0)) ;
		} ,
		getContainer : function () {
			return $($(this.$el).get(0)) ;
		} ,
		virtual2real : function ( p ) {
			var me = this ;
			var img = me.getImg() ;
			var vimg = {
				w:me.iw*(10000+me.cropped.x1+10000-me.cropped.x2)/10000 ,
				h:me.ih*(10000+me.cropped.y1+10000-me.cropped.y2)/10000
			} ;
			var ret = {
				x : -me.iw*me.cropped.x1/10000 + vimg.w*p.x/10000 ,
				y : -me.iw*me.cropped.y1/10000 + vimg.h*p.y/10000
			} ;
			return ret ;
		} ,
		getAnswerStyle : function ( answer ) {
			var me = this ;
			var p = me.virtual2real ( answer.position ) ;
			p.x -= 10 ;
			p.y -= 10 ;
			var ret = { left:p.x+'px' , top:p.y+'px' } ;
			if ( answer.number_focus ) {
				ret.border = '2px solid #2F74D0' ;
				ret.opacity = 1 ;
			}
			return ret ;
		} ,
		imageLoaded : function () {
			var me = this ;
			var img = me.getImg() ;
			me.iw = img.width() ;
			me.ih = img.height() ;

			var container = me.getContainer() ;
			container.width ( me.iw+'px' ) ;
			container.height ( me.ih+'px' ) ;
			
			var tl = me.virtual2real ( { x:0 , y:0 } ) ;
			var br = me.virtual2real ( { x:10000 , y:10000 } ) ;
			img.css ( { top:tl.y+'px' , left:tl.x+'px' } ) ;
			img.width ( (br.x-tl.x)+'px' ) ;
			img.height ( (br.y-tl.y)+'px' ) ;
			
			me.img_loaded = true ;
		} ,
	} ,
}
</script>

<style>
div.image_with_labels_container {
	overflow:hidden;
}
img.image_with_labels {
	position:relative;
	z-index:1;
}
div.image_with_labels_answer {
	position:absolute;
	z-index:5;
	font-size:10pt;
	font-family:sans-serif;
	font-weight:bold;
	cursor:pointer;
	border:1px solid black;
	border-radius:100px;
	background-color:white;
	opacity:0.5;
	box-shadow:3px 3px 2px black;
	width:20px;
	text-align:center;
}
div.image_with_labels_answer:hover {
	opacity:1;
	box-shadow:3px 3px 2px #333;
}
</style>