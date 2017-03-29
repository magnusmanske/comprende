<template>
  <div id="app">
  TEST2
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  }
}
</script>

<style>
div.wikipedia_section {
	font-size:10pt;
	line-height:1.2em;
	color:#333;
	padding-left:5px;
	border-left:10px solid #57BCD9 ;
}
.answer_hint {
	line-height:1em;
	font-size:9pt;
	color:#999;
	display:table-cell;
	padding-left:5px;
	vertical-align:top;
}
div.dontshow {
	display:none;
}
div.page {
	margin-left:auto;
	margin-right:auto;
	max-width:960px;
}
.card-stack {
	margin-top:5px;
	margin-bottom:5px;
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
.question {
/*	margin:5px;
	padding:5px;
	border-radius:10px;
	border:2px solid #EEE;*/
}
div.answer {
	margin:5px;
	padding:2px;
	font-size:14pt;
}
div.answer > div.click {
	display:table-cell !important;
	white-space:nowrap;
	border:2px solid #DDD;
	background-color:#DDD;
	display:inline-block;
	padding:3px;
	border-radius:5px;
	cursor:pointer;
	user-select:none;
	vertical-align:top;
}
</style>
