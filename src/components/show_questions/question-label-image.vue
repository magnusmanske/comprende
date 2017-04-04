<template>
<div v-if='loaded' class="card">
<div class="card-block">

<h4 class="card-title">
<div v-if='!thumbnail' style='float:right;margin:5px;font-size:8pt;'>[<a :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this question' target='_blank'>{{q}}</a>]</div>
{{i.getLabel()[0]}}
</h4>
<h6 class="card-subtitle mb-2 text-muted">{{i.getDescription()[0]}}</h6>
<question-intro :q='q'></question-intro>

<div v-if='image!=""' style='display:table-row'>
<div style='display:table-cell;width:66%;vertical-align:top;border:1px solid black;'>
<image-with-labels :image='image' :width='width' :height='width' :crop='crop' :answers='answers' v-on:answer-clicked='answerClicked'></image-with-labels>
</div>
<div style='disaply:teble-cell;width:33%;vertical-align:top;'>
Blah
</div>
</div>

<!--
<answer v-for='(state,num) in answers' :key='num' :state='state' :check_choice='options.show_choices'></answer>
-->
<div style='text-align:center;border-top:1px solid #EEE;' :class='numberSelectedClass'><i18n k='answers required selected' :params='[num_required,num_selected]'/></div>

</div>
</div>
</template>


<script>
import { wdid , wikidata_site , user } from '../../config.js'
import question_bus from './question_bus.vue'
import wikibaseAPImixin from '../../mixins/wikibaseAPImixin.js'
import QuestionIntro from './question-intro.vue'
import i18n from '../i18n.vue'
import ImageWithLabels from './image-with-labels.vue'

export default {
	mixins : [ wikibaseAPImixin ] ,
	props: [ 'q' , 'options' , 'thumbnail' ] ,
	data : function () { return { i:{} , answers:[] , loaded:false , num_selected:0 , num_required:0 , has_been_answered:false , image:'' , width:600 , crop:'' , user } } ,
	created : function () { this.loadQuestion () } ,
	components : { 'question-intro':QuestionIntro , i18n , 'image-with-labels':ImageWithLabels } ,
	methods : {
		shuffle : function (array) {
		  var currentIndex = array.length, temporaryValue, randomIndex;

		  // While there remain elements to shuffle...
		  while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		  }

		  return array;
		} ,
		answerClicked : function ( answer_id ) {
			
		} ,
		setupImage : function () {
			var me = this ;
			var images = me.i.getStringValues ( wdid.p_image ) ;
			if ( images.length == 0 ) return false ;
			me.image = images[0] ;
			var statements = me.i.getStatements ( wdid.p_image ) ;
			var s = statements[0] ;
			if ( typeof (s.qualifiers||{})[wdid.p_crop] != 'undefined' ) me.crop = s.qualifiers[wdid.p_crop][0].datavalue.value ;
			else me.crop = '' ;
			return true ;
		} ,
		loadQuestion : function () {
			var me = this ;
			me.has_been_answered = false ;
			me.num_selected = 0 ;
			me.loaded = false ;
			me.answers = [] ;
			me.i = me.getItem ( me.q ) ;
			if ( !me.setupImage () ) {
				console.log ( 'ERROR no image' , me.i ) ;
				return ;
			}
			var wd_answers = me.i.getStringValues ( wdid.p_wd_answer ) ;

			function fin () {
				var answers = [] ;
				$.each ( (me.i.json.claims[wdid.p_text_answer]||[]) , function ( k , v ) { answers.push ( {q:me.q,sid:v.id,selected:false,fraction:0} ) } ) ;
				$.each ( (me.i.json.claims[wdid.p_wd_answer]||[]) , function ( k , v ) { answers.push ( {q:me.q,sid:v.id,selected:false,fraction:0} ) } ) ;
			
				me.num_required = 0 ;
				$.each ( answers , function ( dummy , answer ) {
//					answer.thumbnail = me.thumbnail ;//??
					var s = me.i.getStatementByID ( answer.sid ) ;

					if ( typeof (s.qualifiers||{})[wdid.p_position] != 'undefined' ) {
						var pos = s.qualifiers[wdid.p_position][0].datavalue.value.split(',') ;
						answer.position = { x:parseInt(pos[0]) , y:parseInt(pos[1]) } ;
					}
					
					if ( typeof (s.qualifiers||{})[wdid.p_fraction] != 'undefined' ) {
						var qual = s.qualifiers[wdid.p_fraction][0] ;
						answer.fraction = qual.datavalue.value.amount * 1 ;
					}
//					if ( answer.fraction > 0 ) 
					me.num_required++ ;
					
					if ( typeof (s.qualifiers||{})[wdid.p_hint] != 'undefined' ) {
						$.each ( s.qualifiers[wdid.p_hint] , function ( dummy , qual ) { // TODO: abstract finding best language from monolingual qualifier
							if ( qual.datavalue.value.language != 'en' ) return ;
							answer.hint = { text:qual.datavalue.value.text , language:qual.datavalue.value.language } ;
						} ) ;
					}
					
				} ) ;
			
				me.answers = me.shuffle ( answers ) ;
				me.loaded = true ;
			}
			
			if ( wd_answers.length > 0 ) me.loadItemsSite ( wikidata_site , wd_answers , fin ) ;
			else fin() ;
		}
	} ,
	computed : {
		numberSelectedClass : function () {
			return {
				answer_cb_ok : (this.num_required == this.num_selected) ,
				answer_cb_nope : (this.num_required < this.num_selected)
			}
		}
	} ,
	watch : {
		q : function () { this.loadQuestion() } ,
		answers : {
			handler : function ( to , from ) {
				var me = this ;
				var cnt = 0 ;
				var sum = 0 ;
				$.each ( me.answers , function ( k , v ) {
					cnt += v.selected ? 1 : 0 ;
					if ( v.selected ) sum += v.fraction*1 ;
				} ) ;
				me.num_selected = cnt ;
				if ( me.num_required>0 && me.num_required==me.num_selected ) {
					me.$emit ( 'ready_to_check' ) ;
					if ( typeof question_bus != 'undefined' && !me.has_been_answered ) {
						me.has_been_answered = true ; // Let answer only once
						question_bus.$emit ( 'answered' , (sum>=100) , sum ) ;
					}
				}
			} ,
			deep : true
		}
	}
}
</script>

<style>
</style>
