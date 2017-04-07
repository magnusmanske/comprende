<template>
<div v-if='typeof question != "undefined"'>
	<h4 class='card-title'><i18n k='transclusions'/></h4>
	<div v-if='question.transclusions.length>0' class='card'>
		<ul class='list-group list-group-flush'>
			<li v-for='(tc,tc_num) in question.transclusions' :key='tc_num' class='list-group-item'>
				<div v-if='tc.type=="wikipedia"'>
					<div class='row'>
						<input type='text' v-model='tc.language' class='form-control col-sm-1' />
						<div class='col-sm-2'>.wikipedia.org :</div>
						<input type='text' v-model='tc.page' class='form-control col-sm-3' placeholder='page title' @keyup.enter='updateTransclusion(tc_num)' />
						<div class='col-sm-1'><i18n k='section'/></div>
						<input type='number' v-model='tc.section' class='form-control col-sm-1' placeholder='section' />
						<input type='number' v-model='tc.oldid' class='form-control col-sm-1' placeholder='oldid' />
						<button class='col-sm-1 btn btn-outline-secondary' @click='updateTransclusion(tc_num)'><i18n k='show'/></button>
						<button class='col-sm-2 btn btn-outline-danger' @click.prevent='deleteTransclusion(tc_num)'><i18n k='Remove'/></button>
					</div>
					<mediawiki-transclusion v-if='tc.page_url!=""' :page_url='tc.page_url' :section='tc.section' :oldid='tc.oldid' v-on:revid='function(revid){tc.oldid=revid}'></mediawiki-transclusion>
				</div>
				<div v-else>Unknown transclusion type {{tc.type}}</div>
			</li>
		</ul>
	</div>
	<div style='margin-top:5px;'>
		<button class='btn btn-sm btn-outline-success' @click.prevent='addTransclusion'><i18n k='Add transclusion'/></button>
	</div>
</div>
</template>

<script>
import i18n from '../i18n.vue'
import { user , wdid , wikibase_default_site } from '../../config.js'
import mediawiki_transclusion from '../show_questions/mediawiki-transclusion.vue'

export default {
	props : [ 'question' ] ,
	components : {
		'mediawiki-transclusion':mediawiki_transclusion ,
		i18n ,
	} ,
	methods : {
		addTransclusion : function () {
			this.question.transclusions.push ( {
				type : 'wikipedia' ,
				page_url : '' ,
				language : user.settings.language ,
				page : '' ,
				section : '0' ,
				oldid : ''
			} ) ;
		} ,
		deleteTransclusion : function ( num ) {
			this.question.transclusions.splice ( num , 1 ) ;
		} ,
		updateTransclusion : function ( num ) {
			var me = this ;
			var v = me.question.transclusions[num] ;
			if ( v.type == 'wikipedia' ) {
				if ( $.trim(v.page) == '' ) {
					if ( v.page_url != '' ) v.page_url = '' ;
					return ;
				}
				var url = 'https://' + $.trim(v.language) + '.wikipedia.org/wiki/' + encodeURIComponent($.trim(v.page)) ;
				if ( v.page_url != url ) v.page_url = url ;
			}
		} ,
	} ,
	watch : {
		'question.transclusions' : {
			handler : function () {
				var me = this ;
				$.each ( me.question.transclusions , function ( k , v ) {
					if ( v.page_url == '' ) return ;
					me.updateTransclusion ( k ) ;
				} ) ;
			} ,
			deep : 1
		} ,
	} ,
}
</script>

<style>
</style>