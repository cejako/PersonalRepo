function cal(){
	showLoading();
	var htmlStr = $('#htmlRecieved').val();
	if (htmlStr == '') {
		sendAjax();
	}else{
		parseHtml(htmlStr)
	}
}

function parseHtml(htmlStr){
	var totalSeconds = 0;	// 总出勤时间秒数
	var daysSpan = 0;		// 记录当月总共有多少天
	htmlStr = htmlStr.replace(/\r|\n|\t/g,'');
	var regx = /<table id="ctl00_cphMain_CalendarAC"(.|\n)*<\/table>/g;
	var matchedStr = htmlStr.match(regx);
	if (matchedStr == null || matchedStr == '') {
		alert('请求返回信息不正确');
	}else{
		var $weeks = $(matchedStr[0]).children().children();
		for (var i = 2; i < $weeks.length - 1; i++) {
			daysSpan += getValidDaysCountInWeek($weeks[i]);	// 获取该周内工作日时间天数
			$($weeks[i]).children().each(function(index){
				var targetEle = $(this).children('table').find('td[align="center"]').first();
				if (targetEle.html() && targetEle.html().trim().indexOf('~') > 0 && targetEle.html().trim().split('~').length == 2) {
					var times = targetEle.html().trim().split('~');
					var timeSpan = convert2Seconds(times[1]) - convert2Seconds(times[0]);
					totalSeconds += timeSpan;
				};
			});
		};
	}

	show(totalSeconds,daysSpan);
}

function sendAjax(){
	jQuery.support.cors = true;
	var url = "http://oa.cn1.global.ctrip.com/HR/AttendenceCalendar.aspx";
	var month = parseInt($('select').val()) || 0;
	var data = {
		'ctl00$MasterPageSM' : 'ctl00$cphTop$UpnlMonth|ctl00$cphTop$BtnQuery',
		'__EVENTTARGET' : '',
		'__EVENTARGUMENT' : '',
		'__VIEWSTATE' : '/wEPDwUJMjE4NzcwMzI2D2QWAmYPZBYCAgMPZBYGAgMPFgIeBFRleHQFDOWHuuWLpOaPkOmGkmQCBQ9kFgICAQ9kFgJmD2QWBgIBDw8WAh4HVmlzaWJsZWhkFgJmD2QWCAIBDw8WBB8ABRLosKLmuIXotLUgKFM0ODY3MSkeDEF1dG9Qb3N0QmFja2gWBB4Hb25jbGljawUuRW1wbG95ZWVTZWxlY3Rvcl9TZXRFbXAoJ0xlYWRlcicsICdBbGwnLCdBbGwnKR4IcmVhZG9ubHkFBHRydWVkAgMPFgIeBVZhbHVlBQU4MzE2OWQCBQ8WBB8DBRlFbXBsb3llZVNlbGVjdG9yX0RlbEVtcCgpHwFoZAIHDw8WBB4MRXJyb3JNZXNzYWdlBRDor7fpgInmi6nkurrlkZghHhJFbmFibGVDbGllbnRTY3JpcHRnZGQCAw8PFgIfAAUR6LCi5riF6LS1KFM0ODY3MSlkZAIFDxBkDxYCZgIBFgIQBQbmnKzmnIgFATBnEAUG5LiK5pyIBQItMWdkZAIHD2QWAgIBD2QWAmYPZBYCAgEPPCsACgEADxYCHwFoZGRk7sobZOzU7pJYmoGAzMa0Ogfr+tI=',
		'__SCROLLPOSITIONX' : 0,
		'__SCROLLPOSITIONY' : 0,
		'__EVENTVALIDATION' : '/wEWBALo0aqjCQKK78HzCgKZ743wCgLepsOwCa4BbRV78r0y0FOn725zhQhq+2Rz',
		'ctl00$cphTop$DdlMonth' : month,
		'ctl00$cphTop$BtnQuery' : '查询'
	};
	$.ajax({
		type:'POST',
		url:url,
		data:data,
		dataType:'html',
		success:parseHtml,
		error:function(e){
			alert(e);
		}
	});
}

function getValidDaysCountInWeek(week){
	var count = 0;
	var children = $(week).children('td');
	for (var i = 0; i < children.length; i++) {
		if (i != 0 && i != 6 && $(children[i]).html().trim() != '') {
			count += 1;
		};
	};
	
	return count;
}

function convert2Seconds(timeStr){
	if (timeStr.indexOf(':') < 0) {
		return 0;
	};
	var timeStrArray = timeStr.split(':');
	var secondsRatio = [3600,60,1];
	var sumSeconds = 0;
	for (var i = 0; i < timeStrArray.length; i++) {
		if (isNaN(timeStrArray[i])) {
			throw '日期格式不正确';
		};
		sumSeconds += parseInt(timeStrArray[i]) * secondsRatio[i];
	};
	return sumSeconds;
}

function show(totalSeconds,daysSpan){
	var totalHours = totalSeconds / 3600;
	var totalDays = (totalSeconds / 3600 / 9).toFixed(2);
	var overTimeHours = (totalSeconds - daysSpan * 9 * 3600) / 3600;
	var trStr = '<tr>'+
					'<td align="center" >' + daysSpan + '</td>'+
					'<td align="center" >' + totalHours + '</td>'+
					'<td align="center" >' + totalDays + '</td>'+
					'<td align="center" >' + overTimeHours + '</td>'+
				'</tr>';
	$('#result').append(trStr);
	hideLoading();
}

function showLoading(){
	$('.layer').show();
	$('.loading').show();
}
function hideLoading(){
	$('.layer').hide();
	$('.loading').hide();
}