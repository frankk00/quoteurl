/**
 * QuoteURL - URL for Twitter Dialogues
 *
 * Copyright (c) 2009, Fabricio Zuardi
 * All rights reserved.
 *  
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 
 *   * Redistributions of source code must retain the above copyright
 *     notice, this list of conditions and the following disclaimer.
 *   * Redistributions in binary form must reproduce the above copyright
 *     notice, this list of conditions and the following disclaimer in
 *     the documentation and/or other materials provided with the
 *     distribution.
 *   * Neither the name of the author nor the names of its contributors
 *     may be used to endorse or promote products derived from this
 *     software without specific prior written permission.
 *  
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/

//container for the tweets that will make a quote
var tweetlist = {}

// global preferences
var preferences = {
    'order' : 'asc'
}

/** Load the contents of the tweet to be added to the preview panel **/
function loadTweet(){
    //disable add button
    $('add-tweet-button').set('disabled','disabled')
    $('add-tweet-button').set('value','…')
    //extract id from the input
    var statusId = $('status-id-field').get('value').replace(/(http:\/\/twitter.com\/.*\/status\/)?([^\/|\?|#]*).*/ig,'$2')
    //request tweet
    var url = '/a/loadtweet'
    var jsonRequest = new Request.JSON({'url': url, onComplete: requestComplete, onSuccess: onTweetLoaded, onFailure: onTweetLoadFailure}).get({'id': statusId, 'fmt': 'json'});
    return false
}

/** Callback function when the request completes, regardless of if it succeded or failed **/
function requestComplete(r){
    //re-enable add button and clean the text input
    $('add-tweet-button').set('value','+')
    $('add-tweet-button').erase('disabled')
    $('status-id-field').set('value','')
}

/** Callback function to run if there was an error **/
function onTweetLoadFailure(r){
    console.log('FAIL')
    console.log(r)
    var feedbackdiv = $('feedback')
    feedbackdiv.className = 'FAIL'
    feedbackdiv.style.backgroundColor = '#c33'
    feedbackdiv.fade('show')
    feedbackdiv.tween('background-color', '#fee')
    setTimeout(function(){$('feedback').fade('out')}, 2300)
}

/** Callback function to run if the tweet content is returned **/
function onTweetLoaded(response){
    console.log(response)
    //add the loaded tweet to the quote
    tweetlist[response.id] = response;
    addTweetToPreview(response)
}

/** Modify the page to include the loaded tweet in the preview panel **/
function addTweetToPreview(tweet){
    var tweet_time = Date.parse(tweet.created_at)
    var isotime = ISOTime(tweet_time)
    var humantime= elapsedTime(tweet_time)
    var newTweet = new Element('li',{
        'id' : 'status_'+tweet.id,
        'class' : 'hentry status u-'+tweet.user.screen_name,
        'style' : 'left:-100%',
        '_time' : tweet_time})
    var html = ''
    html += '    <div class="thumb vcard author">'
    html += '        <a class="url" href="http://twitter.com/'+tweet.user.screen_name+'">'
    html += '            <img width="48" height="48" src="'+tweet.user.profile_image_url+'" class="photo fn" alt="'+tweet.user.name+'"/>'
    html += '        </a>'
    html += '    </div>'
    html += '    <div class="status-body">'
    html += '        <a class="author" title="'+tweet.user.name+'" href="http://twitter.com/'+tweet.user.screen_name+'">'+tweet.user.screen_name+'</a>'
    html += '        <span class="entry-content">'
    html += '            '+twitter_at_linkify(linkify(tweet.text))
    html += '        </span>'
    html += '        <span class="meta entry-meta">'
    html += '            <a rel="bookmark" class="entry-date" href="http://twitter.com/'+tweet.user.screen_name+'/status/'+tweet.id+'">'
    html += '            <span title="'+isotime+'" class="published">'+humantime+'</span></a> <span>from '+tweet.source+'</span>'
    html += '        </span>'
    html += '    </div>'
    html += '    <div class="actions">'
    html += '        <a class="del" href="#" id="del_'+tweet.id+'" onclick="return removeTweet(this);">x</a>'
    html += '    </div>'
    newTweet.innerHTML = html
    //existing tweets in the quote preview
    var quote_tweets = $$('li')
    if(quote_tweets.length == 0){
        var container = $('quote')
        newTweet.inject(container)
    } else {
        for(var i=0; i< quote_tweets.length; i++){
            if (tweetComesBefore(newTweet, quote_tweets[i])){
                newTweet.inject(quote_tweets[i],'before')
                quote_tweets[i].style.top = '-'+newTweet.offsetHeight+'px'
                quote_tweets[i].set('tween', {duration: 'short'})
                quote_tweets[i].tween('top', '0px')
                break
            }
            //last position
            if (i == quote_tweets.length-1){
                newTweet.inject(quote_tweets[i],'after')
            }
        }
    }
    newTweet.set('tween', {duration: 'long'});
    newTweet.tween('left', '0%');
}

/** Compare 2 tweets and return true if tweet a comes before b in the current ordering (timestamp-based) **/
function tweetComesBefore(a,b){
    if (preferences.order == 'asc') {
        return (a.get('_time') < b.get('_time'))
    } else {
        return (a.get('_time') > b.get('_time'))
    }
}

/** Remove the Tweet from the preview panel and from the list **/
function removeTweet(del_button){
    var tweet_id = del_button.id.substring('del_'.length, del_button.id.length)
    console.log(tweet_id)
    console.log(tweetlist)
    delete tweetlist[tweet_id]
    console.log(tweetlist)
    $('status_'+tweet_id).dispose()
    return false
}

/** Validate and sends necessary data to create the new quote page **/
function createQuote(){
    return false
}


//--- Utilities --


/** Complete date plus hours, minutes and seconds as specified in ISO 8601 **/
function ISOTime(time){
    var date = new Date();
    date.setTime(time)
    var year = date.getUTCFullYear()
    var month = date.getUTCMonth()+1
    var day = date.getUTCDate()
    var hours = date.getUTCHours()
    var minutes = date.getUTCMinutes()
    var seconds = date.getUTCSeconds()
    var items = [month, day, hours, minutes, seconds]
    items.each( function(item){ if (item < 10) item = '0' + item });
    return year+'-'+month+'-'+day+'T'+hours+':'+minutes+':'+seconds+'+00:00'
}

/** Human-friendly elapsed time messages **/
function elapsedTime(time){
    var date = new Date();
    date.setTime(time)
    var delta = $time() - time
    var intervals = {
        '1000' : 'just now',
        '30000' : '{s} seconds ago',
        '60000' : 'less than a minute ago',
        '120000' : 'one minute ago',
        '3600000' : '{m} minutes ago',
        '7200000' : 'about one hour ago',
        '86400000' : 'about {h} hours ago',
        '172800000' : 'yesterday',
        '2592000000' : '{d} days ago'
    }
    for (var i in intervals){
        var replacements = {
                's' : Math.floor(delta/1000),
                'm' : Math.floor(delta/1000/60),
                'h' : Math.floor(delta/1000/60/60),
                'd' : Math.floor(delta/1000/60/60/24)
            };
        if (delta < i){
            return intervals[i].substitute(replacements)
        }
    }
    return (date.getMonth()+1)+'/'+date.getDate()+
    ((date.getFullYear() == new Date().getFullYear()) ? '' : ('/'+date.getFullYear()))+ 
    (' - '+date.getHours()+':'+date.getMinutes());
}

/** turn text web urls into html a links **/
function linkify(s) {
    var re = /(http:\/\/|ftp:\/\/|https:\/\/|www\.|ftp\.[\w]+)([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])/gi;
    var result = s.replace(re, '<a href="$1$2" >$1$2</a>');
    return result;
}

/** turn @nicknames into html links for the twitter page for that user **/
function twitter_at_linkify(s){
    var re = /(@)([\w]+)/gi;
    var result = s.replace(re, '<a href="http://twitter.com/$2" >$1$2</a>');
    return result;
}