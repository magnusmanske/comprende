<template>
<div class='answer'>

<div class='click' @click.prevent='onClick'>
	<div style='display:inline-block;width:20pt;text-align:center;'><span v-if='state.selected' class='answer_cb' :class='checkmarkClass'>&#10003;</span></div>
	<div style='display:inline-block;'>
		<span v-if='type==wdid.p_text_answer'>{{label.text}}</span>
		<span v-else-if='type==wdid.p_wd_answer'>{{label.text}}</span>
		<span v-else style='color:red'>{{label.text}}</span>
		<small v-if='label.language!=wikibase_default_site.language' style='color:#BBB'>[{{label.language}}]</small>
	</div>
</div>
<div style='display:table-cell;white-space:nowrap;padding-left:3px;' v-if='type==wdid.p_wd_answer'> <small>[<a :href='"https://www.wikidata.org/wiki/"+answer_wd_q' target='_blank'>{{answer_wd_q}}</a>]</small></div>

<div v-if='check_choice && state.selected && state.hint' class='answer_hint'>{{state.hint.text}}</div>

</div>
</template>


<script>
import wdid from '../../config/wdid.js'
import wikidata from '../../config/wikidata_site.js'
import wikibase_default_site from '../../config/wikibase_default_site.js'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props: [ 'state' , 'check_choice' ] ,
	data : function () { return { q:'' , statement:{} , label:'' , type:0 , answer_wd_q:0 , use_class:'' , wdid , wikibase_default_site } } ,
	created : function () { this.init () } ,
	computed : {
		checkmarkClass : function () {
			if ( this.check_choice ) {
				if ( this.state.fraction > 0 ) return { answer_cb_ok:true } ;
				return { answer_cb_nope:true } ;
			}
			return { answer_cb_default:true }
		}
	} ,
	methods : {
		init : function () {
			var me = this ;
			var i = me.getItem ( me.state.q ) ;
			me.statement = i.getStatementByID ( me.state.sid ) ;
			me.label = { text:"Unrecognised statement "+me.statement.id , language:'en' } ;
			me.type = me.statement.mainsnak.property ;
			if ( me.statement.mainsnak.property == wdid.p_text_answer ) me.label = me.statement.mainsnak.datavalue.value ;
			if ( me.statement.mainsnak.property == wdid.p_wd_answer ) {
				me.answer_wd_q = me.statement.mainsnak.datavalue.value ;
				var si = me.getItemSite ( wikidata , me.answer_wd_q ) ;
				var l = si.getLabel() ;
				me.label = { text:l[0] , language:l[1] } ;
			}
		} ,
		onClick : function () {
			this.state.selected = !this.state.selected ;
		}
	} ,
	watch : {
		state : {
			handler : function () { this.init() } ,
			deep : true
		}
	}
}
</script>

<style>
</style>
