<template>
<div v-if='loaded' class="card">
<div class="card-block">

<h4 class="card-title">
<div v-if='!thumbnail' style='float:right;margin:5px;font-size:8pt;'>[<a class='wb' :href='"/comprende/index.php?title=Item:"+q' title='See/edit the data item for this question' target='_blank'>{{q}}</a>]</div>
{{title}}
</h4>
<h6 class="card-subtitle mb-2 text-muted">{{subtitle}}</h6>
<question-intro :q='q'></question-intro>

<div v-if='image!=""' class='qli_payload_container'>
<div class='qli_image_container'>
<image-with-labels :image='image' :width='width' :height='width' :crop='crop' :answers='answers' v-on:answer-clicked='onNumberClicked'></image-with-labels>
</div>
<div class='qli_answers_container'>
	<answer v-for='(state,num) in answers' :key='num' :state='state' :check_choice='options.show_choices' v-on:answer_clicked='onAnswerClicked'></answer>
</div>
</div>

<div style='text-align:center;border-top:1px solid #EEE;' :class='numberSelectedClass' class='no-print'>
	<i18n k='answers required selected' :params='[num_required,num_selected]'/>
</div>
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
import answer from './answer.vue'
import QuestionMixin from '../../mixins/QuestionMixin.vue'

export default {
	mixins : [ wikibaseAPImixin , QuestionMixin ] ,
	props: [ 'q' , 'options' , 'thumbnail' ] ,
	data : function () { return { i:{} , answers:[] , loaded:false , num_selected:0 , num_required:0 , has_been_answered:false , image:'' , width:600 , crop:'' , user , chosen_answer:undefined , chosen_number:undefined } } ,
	created : function () { this.loadQuestion() } ,
	updated : function () { this.checkWidth() } ,
	components : { 'question-intro':QuestionIntro , i18n , 'image-with-labels':ImageWithLabels , answer } ,
	methods : {
		checkWidth : function () {
//			var w = parseInt($($(this.$el).find('div.card-block').get(0)).width()) ;
			var w = parseInt($('#app').width()) ;
			if ( w < this.width ) this.width = w-20 ;
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
			me.checkWidth() ;
			me.has_been_answered = false ;
			me.num_selected = 0 ;
			me.loaded = false ;
			me.answers = [] ;
			me.i = me.getItem ( me.q ) ;
			me.setTitle() ;
			if ( !me.setupImage () ) {
				console.log ( 'ERROR no image' , me.i ) ;
				return ;
			}
			var wd_answers = me.i.getStringValues ( wdid.p_wd_answer ) ;
			
			function getNewAnswer ( sid , opt ) {
				var ret = {q:me.q,sid:sid,selected:false,fraction:-1,single_focus:true,has_focus:false,num:0,check_text:'',number_focus:false,number_highlight:false} ;
				$.each ( (opt||{}) , function ( k , v ) { ret.k = v } ) ;
				return ret ;
			}

			function fin () {
				var answers = [] ;
				$.each ( (me.i.json.claims[wdid.p_text_answer]||[]) , function ( k , v ) { answers.push ( getNewAnswer(v.id) ) } ) ;
				$.each ( (me.i.json.claims[wdid.p_wd_answer]||[]) , function ( k , v ) { answers.push ( getNewAnswer(v.id) ) } ) ;
			
				me.num_required = 0 ;
				var sum_fraction = 0 ;
				var no_fraction = 0 ;
				var nums = [] ;
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
						sum_fraction += qual.datavalue.value.amount * 1 ;
					}
					if ( answer.fraction < 0 ) no_fraction++ ;
					me.num_required++ ;
					
					if ( typeof (s.qualifiers||{})[wdid.p_hint] != 'undefined' ) {
						$.each ( s.qualifiers[wdid.p_hint] , function ( dummy , qual ) { // TODO: abstract finding best language from monolingual qualifier
							if ( qual.datavalue.value.language != 'en' ) return ;
							answer.hint = { text:qual.datavalue.value.text , language:qual.datavalue.value.language } ;
						} ) ;
					}
					
					nums.push ( dummy+1 ) ;
				} ) ;
				
				if ( no_fraction > 0 || sum_fraction == 0 ) {
					if ( sum_fraction == 0 ) no_fraction = answers.length ;
					var remaining_fraction = (100-sum_fraction) / no_fraction ;
					$.each ( answers , function ( k , v ) {
						if ( v.fraction == -1 || sum_fraction == 0 ) v.fraction = remaining_fraction ;
					} ) ;
				}
				
				nums = me.shuffle ( nums ) ;
				me.answers = me.shuffle ( answers ) ;
				$.each ( me.answers , function ( k , v ) {
					v.num = nums.pop() ;
				} ) ;

				me.loaded = true ;
			}
			
			if ( wd_answers.length > 0 ) me.loadItemsSite ( wikidata_site , wd_answers , fin ) ;
			else fin() ;
		} ,
		onNumberClicked : function ( answer_id ) {
			var me = this ;
			if ( me.answers[answer_id].number_focus ) {
				me.answers[answer_id].number_focus = false ;
				return ;
			}
			$.each ( me.answers , function ( k , v ) {
				v.number_focus = false ;
			} ) ;
			me.answers[answer_id].number_focus = true ;
			me.chosen_number = answer_id ;
			me.matchNumberAnswer() ;
		} ,
		onAnswerClicked : function ( answer ) {
			var me = this ;
			me.chosen_answer = undefined ;
			$.each ( me.answers , function ( k , v ) {
				if ( v.num == answer.num ) {
					me.chosen_answer = answer.has_focus ? k : undefined ;
				} else {
					v.has_focus = false ;
				}
			} ) ;
			me.matchNumberAnswer() ;
		} ,
		matchNumberAnswer : function () {
			var me = this ;
			if ( typeof me.chosen_answer == 'undefined' ) return ;
			if ( typeof me.chosen_number == 'undefined' ) return ;
			$.each ( me.answers , function ( k , v ) {
				if ( me.answers[me.chosen_answer].check_text == v.num ) v.number_highlight = false ;
			} ) ;
			$.each ( me.answers , function ( k , v ) {
				if ( v.check_text != me.answers[me.chosen_number].num ) return ;
				v.check_text = '' ;
				v.selected = false ;
			} ) ;
			me.answers[me.chosen_answer].check_text = me.answers[me.chosen_number].num ;
			me.answers[me.chosen_answer].selected = true ;
			me.answers[me.chosen_answer].has_focus = false ;
			me.answers[me.chosen_number].number_focus = false ;
			me.answers[me.chosen_number].number_highlight = true ;
			me.chosen_answer = undefined ;
			me.chosen_number = undefined ;
			if ( me.options.autocomplete_last_possible ) {
				var unmatched = [] ;
				var used_numbers = {} ;
				$.each ( me.answers , function ( k , v ) {
					if ( v.check_text == '' ) unmatched.push ( k ) ;
					else used_numbers[v.check_text] = 1 ;
				} ) ;
				if ( unmatched.length == 1 ) {
					var available_number ;
					$.each ( me.answers , function ( k , v ) {
						v.number_highlight = true ;
						if ( typeof used_numbers[v.num] == 'undefined' ) available_number = v.num ;
					} ) ;
					me.answers[unmatched[0]].check_text = available_number ;
					me.answers[unmatched[0]].selected = true ;
				}
			}
		} ,
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
					if ( v.num == v.check_text ) sum += v.fraction*1 ;
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
		} ,
		'user.settings' : { handler : function () { this.setTitle() } , deep : true } ,
	}
}
</script>

<style>
div.qli_image_container {
	vertical-align:top;
}
div.qli_answers_container {
	vertical-align:top;
	margin-left:5px;
	overflow:auto;
}

@media screen and (orientation:portrait) {
}
@media screen and (orientation:landscape) {
	div.qli_answers_container {
		display:table-cell;
		width:33%;
		max-width:33%;
		zoom:0.8;
	}
	div.qli_image_container {
		display:table-cell;
		width:66%;
	}
	div.qli_payload_container {
		display:table-row;
	}
}

@media print {
	div.qli_answers_container {
		display:table-cell;
		width:33%;
		max-width:33%;
		zoom:0.8;
	}
	div.qli_image_container {
		display:table-cell;
		width:66%;
	}
	div.qli_payload_container {
		display:table-row;
	}
}
</style>
