<template>
<div class='answer'>

<div class='click' :class='{answer_with_focus:state.has_focus}' @click.prevent='onClick'>
	<div class='answer_checkmark_container'>
		<span v-if='state.checkable && state.selected' class='answer_cb' :class='checkmarkClass'>&#10003;</span>
		<span v-if='(state.check_text||"")!=""' :class='checkmarkClass'>{{state.check_text}}</span>
	</div>
	<div class='answer_text_container'>
		<span v-if='type==wdid.p_text_answer'>{{label.text}}</span>
		<span v-else-if='type==wdid.p_wd_answer'>{{label.text}}</span>
		<span v-else style='color:red'>{{label.text}}</span>
		<small v-if='label.language!=user.settings.language' style='color:#BBB' @click.prevent='onEditAnswer'>[{{label.language}}]</small>
	</div>
</div>
<div style='display:table-cell;white-space:nowrap;padding-left:3px;' v-if='type==wdid.p_wd_answer && user.settings.show_wikidata_links'> <small>[<a :href='"https://www.wikidata.org/wiki/"+answer_wd_q' target='_blank'>{{answer_wd_q}}</a>]</small></div>

<div v-if='check_choice && state.selected && state.hint' class='answer_hint'>{{state.hint.text}}</div>

</div>
</template>


<script>
import { wdid , wikidata_site , wikibase_default_site , user } from '../../config.js'
import translationMixin from '../../mixins/translationMixin.js'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'

export default {
	mixins : [ wikibaseAPImixin , translationMixin ] ,
	props: [ 'state' , 'check_choice' ] ,
	data : function () { return { q:'' , statement:{} , label:'' , type:0 , answer_wd_q:0 , use_class:'' , wdid , user } } ,
	created : function () { this.init () } ,
	computed : {
		checkmarkClass : function () {
			var me = this ;
			if ( me.check_choice ) {
				if ( me.state.checkable ) {
					if ( me.state.fraction > 0 ) return { answer_cb_ok:true } ;
					return { answer_cb_nope:true } ;
				} else {
					if ( (me.state.check_text||'') != '' ) {
						return {
							answer_cb_ok : (me.state.check_text==me.state.num) ,
							answer_cb_nope : (me.state.check_text!=me.state.num) ,
						}
					}
				}
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
				var si = me.getItemSite ( wikidata_site , me.answer_wd_q ) ;
				var l = si.getLabel(user.settings.language) ;
				me.label = { text:l[0] , language:l[1] } ;
			}
		} ,
		onClick : function () {
			if ( this.state.checkable ) this.state.selected = !this.state.selected ;
			if ( this.state.single_focus ) this.state.has_focus = !this.state.has_focus ;
			this.$emit('answer_clicked',this.state) ;
		} ,
		onEditAnswer : function ( label ) {
			return ; // TEMPORARILY DEACTIVATED
			var me = this ;
			if ( me.statement.mainsnak.property != wdid.p_text_answer ) return ;

			var initial_value = label.text ;
			var t = me.getTranslation ( 'translate_to' , me.getAllUserLanguages() ) ;
			var result = prompt ( t.translation , initial_value ) ;
			if ( result === null || result == initial_value ) return ;
			me.addTranslation ( result , user.settings.language ) ;
		} ,
		addTranslation : function ( text , lang ) {
			var me = this ;
			var q = me.statement.id.replace ( /\$.*$/ , '' ) ;
			var data = me.newClaimMonolingual ( {
				text:text ,
				language:lang ,
				property:wdid.p_text_answer ,
				qualifiers : me.statement.qualifiers
			} ) ;
			var params = {
				action:'wbeditentity' ,
				id:q ,
				data:JSON.stringify ( {claims:[data]} )
			} ;
			me.getToken ( function ( token ) {
				params.token = token ;
				params.format = 'json' ;
				$.post ( wikibase_default_site.api , params , function ( d ) {
					if ( d.success ) {
						me.reloadItems ( [ q ] , function () {
						} ) ;
					} else {
						console.log ( d ) ;
						alert ( d.error.info ) ;
					}
				} , 'json' ) ;
			} ) ;

		} ,
	} ,
	watch : {
		state : { handler : function () { this.init() } , deep : true } ,
		'user.settings' : { handler : function () { this.init () } , deep : true } ,
	}
}
</script>

<style>
.answer_hint {
	line-height:1em;
	font-size:9pt;
	color:#999;
	display:table-cell;
	padding-left:5px;
	vertical-align:top;
}
.answer_cb {
	font-weight:bold;
}
.answer_cb_default {
	color:blue;
}
.answer_cb_ok {
	color:green;
}
.answer_cb_nope {
	color:red;
}
div.answer {
	margin:5px;
	padding:2px;
	font-size:14pt;
}
div.answer > div.click {
	display:table-cell !important;
	white-space:nowrap;
	border:3px solid #DDD;
	background-color:#DDD;
	display:inline-block;
	padding:3px;
	border-radius:5px;
	cursor:pointer;
	user-select:none;
	vertical-align:top;
}
div.answer_with_focus {
	border:3px solid #2F74D0 !important;
}
div.answer_checkmark_container {
	display:inline-block;
	width:20pt;
	text-align:center;
}
div.answer_text_container {
	display:inline-block;
}

@media print {

div.answer > div.click {
	background-color:none;
}

}
</style>
