<template>
<div>
	<div v-if='error!=""'>{{error}}</div>
	
	<div v-else-if='loaded' class='wikipedia_section'>
		<div class='transcluded_from_mediawiki'><div v-html='text'></div></div>
		<div class='license_note'>©<a target='_blank' :href='page_url'><i18n k='Wikipedia'/></a>, <a href='https://creativecommons.org/licenses/by-sa/3.0/' target='_blank' class='external'><i18n k='CC-BY-SA-3.0'/></a></div>
	</div>
	
	<div v-else><i><i18n k='loading'/></i></div>
</div>
</template>

<script>
import i18n from '../i18n.vue'

export default {
	props : [ 'page_url' , 'section' , 'oldid' , 'detailed' ] ,
	data : function () { return { loaded:false , error:'' , page:'' , api:'' , text:'' } } ,
	components : { i18n } ,
	created : function () { this.init() } ,
	methods : {
		wp_html2text : function ( s ) {
			var me = this ;
			var o = $("<div>"+s+"</div>") ;
			if ( me.detailed ) {
				o.find('.error').remove() ;
				o.find('.ambox').remove() ;
				o.find('a').each ( function ( dummy , a ) {
					var href = $(a).attr('href') ;
					var m = href.match ( /^\/wiki\/(.+)$/ ) ;
					if ( m == null ) return ;
					href = me.api.replace(/\/[^\/]+$/,'') + "/index.php?title=" + encodeURIComponent(m[1]) ;
					$(a).attr({href:href,target:'_blank'}).addClass('wikipedia') ;
				} ) ;
			} else {
				o.find('script').remove() ;
				o.find('ol.references').remove() ;
				o.find('sup.reference').remove() ;
				o.find('.infobox').remove() ;
				o.find('.noprint').remove() ;
				o.find('.mw-editsection').remove() ;
				o.find('div.hatnote').remove() ;
				o.find('div.thumb').remove() ;
				o.find('div.tright').remove() ;
				for ( var n = 1 ; n < 10 ; n++ ) o.find('h'+n).each ( function () {
					var p = $(this) ;
					p.replaceWith('<p>' + p.html() +'</p>') ;
				} ) ;
				o.find('a').each ( function () { $(this).replaceWith ( $(this).text() ) } ) ;
			}
			return o.html() ;
		} ,
		init : function () {
			var me = this ;
			var m = me.page_url.match ( /^(https{0,1}:\/\/.+?)\/wiki\/(.+)$/ ) ;
			if ( m === null ) {	me.error = "Can not find the API for " + me.page_url ; return ; }
			if ( $.trim(me.section) == '' ) {	me.error = "Section required for " + me.page_url ; return ; }
			me.api = m[1] + '/w/api.php?callback=?' ;
			me.page = $.trim(m[2].replace(/_/g,' ')) ;

			var params = { action:'parse' , prop:'text|revid' , format:'json' , disabletoc:1 , disableeditsection:1 , mobileformat:1 , section:me.section } ;
			if ( !me.detailed ) params.noimages = 1 ;
			if ( (me.oldid||'') == '' ) params.page = me.page ;
			else params.oldid = me.oldid ;

			me.loaded = false ;
			
			$.getJSON ( me.api , params , function ( d ) {
				if ( typeof (d.parse||{}).text == 'undefined' ) return ;
				me.text = me.wp_html2text(d.parse.text['*']) ;
				me.$emit ( 'revid' , d.parse.revid ) ;
			} )
			.always ( function () { me.loaded = true } ) ;
		} ,
	} ,
	watch : {
		page_url : function () { this.init() } ,
		section : function () { this.init() } ,
		oldid : function () { this.init() } ,
	}
}
</script>

<style>
div.wikipedia_section {
	font-size:10pt;
	line-height:1.2em;
	color:#333;
	padding:2px;
	padding-left:5px;
	border:1px solid #57BCD9 ;
	border-left:10px solid #57BCD9 ;
	margin-top:3px;
	margin-bottom:3px;
}
div.transcluded_from_mediawiki {
	overflow:hidden;
}
div.transcluded_from_mediawiki div.tright { float:right; clear:right; margin-left:10px; margin-bottom:10px; }
div.transcluded_from_mediawiki div.tleft { float:left; clear:left; margin-right:10px; margin-bottom:10px; }
div.transcluded_from_mediawiki .infobox { float:right; margin-left:10px; margin-bottom:10px; }
</style>