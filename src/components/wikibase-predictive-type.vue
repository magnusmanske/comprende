<template id='wikibase-predictive-type-template'>
<div>
<input type='text' class='form-control col-6 wbpt_query' style='display:inline-block' :placeholder='placeholder' v-model='text' @keyup='onKeyLift' @keyup.down.prevent='onKeyDown' @keyup.up.prevent='onKeyUp' @keyup.enter.prevent='onEnter' />
<span v-if='typeof item!="undefined" && item!=""' class='wbpt_item_id'>[<a target='_blank' :href='"https://www.wikidata.org/wiki/"+item'>{{item}}</a>]</span>
<div v-if='state!="chosen"' class='wbpt_predictive_list'>
<div v-if='state==""' style='color:#DDD'><i><i18n k='empty'/></i></div>
<div v-else-if='state=="loading"' style='color:#DDD'><i><i18n k='searching'/></i></div>
<div v-else-if='state=="failed"' style='color:#DDD'><i><i18n k='search query failed'/></i></div>
<div v-else-if='state=="loaded"'>
	<div v-if='results.length==0' style='color:#DDD'><i><i18n k='no search results'/></i></div>
	<div v-else>
		<div v-for='(r,num) in results' class='wbpt_result' :class='{wbpt_selected_result:(num==result_selected)}' @click.prevent='setFromResult(r)'>
			<div class='wbpt_label'>
				<span class='wbpt_label_text'>{{r.label}}</span>
<!--				<span class='wbpt_item_id'>[{{r.id}}]</span>-->
			</div>
			<div class='wbpt_description'>{{r.description}}</div>
		</div>
	</div>
</div>
<div v-else>Unknown state: "{{state}}"</div>
</div>
</div>
</template>


<script>
import i18n from './i18n.vue'
import wikibaseAPImixin from '../mixins/wikibaseAPImixin.js'
import { wdid , wikibase_default_site } from '../config.js'

export default {
	props : [ 'initial_item' , 'initial_text' , 'type' , 'site' , 'nofocus' , 'placeholder_key' , 'type_filters' , 'max_results' ] ,
	data : function () { return { state:'' , results:[] , last_text:'' , result_selected:-1 , text:'' , item:0 , placeholder:'' } } ,
	components : { i18n } ,
	mixins : [ wikibaseAPImixin , i18n ] ,
	created : function () {
		if ( typeof initial_text != 'undefined' ) this.text = this.initial_text ;
		if ( typeof initial_item != 'undefined' ) this.item = this.initial_item ;
		if ( typeof this.site == 'undefined' || this.site=='' ) this.site = wikibase_default_site ; // Default: main site
		this.autofocus = !this.nofocus ;
		if ( this.placeholder_key != '' ) this.placeholder = this.tr ( this.placeholder_key ) ;
	} ,
	mounted : function () {
		var me = this ;
		me.showPredictiveListBox() ;
		var input = me.getQueryInput() ;
		if ( me.autofocus ) input.focus() ;
		else $(me.$el).find('div.wbpt_predictive_list').hide();
		me.autofocus = true ;
		me.onKeyLift() ; // First load
	} ,
	methods : {
		getQueryInput : function () {
			return $($(this.$el).find('input.wbpt_query').get(0)) ;
		} ,
		showPredictiveListBox : function () {
			var me = this ;
			var input = me.getQueryInput() ;
			var list = $($(this.$el).find('div.wbpt_predictive_list').get(0)) ;
			var p = input.position() ;
			list.position ( p.left , p.top + input.height() ) ;
			list.show() ;
		} ,
		setFromResult : function ( r ) {
			var me = this ;
			me.item = r.id ;
			me.text = r.label ;
			me.last_text = me.text ;
			me.state = 'chosen' ;
			me.$emit ( 'set_item' , me.item , me.text ) ;
		} ,
		onKeyUp : function () {
			var me = this ;
			if ( me.result_selected <= 0 ) return ;
			me.result_selected-- ;
		} ,
		onKeyDown : function () {
			var me = this ;
			if ( me.result_selected+1 >= me.results.length ) return ;
			me.result_selected++ ;
		} ,
		onEnter : function () {
			var me = this ;
			if ( me.result_selected < 0 ) return ;
			me.setFromResult ( me.results[me.result_selected] ) ;
		} ,
		onFilterSearchResults : function ( d ) {
			var me = this ;
			
			function fin () {
				me.result_selected = -1 ;
				me.results = d.search ;
				me.state = 'loaded' ;
			}
			
			if ( (me.type_filters||[]).length == 0 ) return fin() ; // No filters, return everything
			
			// This will limit search results to those of one of the types in type_filters
			// Slow, but more precise
			var to_load = [] ;
			$.each ( d.search , function ( k , v ) { to_load.push ( v.id ) } ) ;
			me.loadItems ( to_load , function () {
				var search2 = [] ;
				$.each ( d.search , function ( k , v ) {
					if ( search2.length >= (me.max_results||7) ) return ;
					var i = me.getItem ( v.id ) ;
					if ( typeof i == 'undefined' ) return ;
					var is_correct_type = false ;
					var types = i.getItemValues ( wdid.p_type ) ;
					$.each ( types , function ( dummy , qt ) {
						if ( -1 == $.inArray ( qt , me.type_filters ) ) return ;
						is_correct_type = true ;
					} ) ;
					if ( is_correct_type ) search2.push ( v ) ;
				} ) ;
				d.search = search2 ;
				fin() ;
			} ) ;
		} ,
		onKeyLift : function () {
			var me = this ;
			var input = me.getQueryInput() ;
			me.text = input.val() ;
			if ( me.text == '' ) {
				me.results = [] ;
				me.result_selected = -1 ;
				me.state = '' ;
				return ;
			}
			if ( me.text == me.last_text ) return ;
			me.last_text = me.text ;
			me.state = 'loading' ;
			var url = me.site.api ;
			$.getJSON ( url+'?callback=?' , {
				action:'wbsearchentities',
				search:me.text,
				format:'json',
				limit:(me.type_filters||[]).length==0?(me.max_results||7):50 ,
				language:me.site.language,
				type:me.type
			} , function ( d ) {
				me.onFilterSearchResults ( d ) ;
			} ) . fail ( function () {
				me.state = 'failed' ;
			} ) . always ( function () {
				me.showPredictiveListBox() ;
			} ) ;
			
		}
	} ,
}
</script>

<style scoped>
</style>
