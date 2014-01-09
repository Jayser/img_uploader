/*
 * jQpup // https://github.com/Jayser/jQpup
 */
(function( $ ){
    
    // jQpup
    $.fn.jQpup = function() 
    {
        return this.each(function() {     

            var $this       = $(this),
                h_document  = $(document).height(),
                w_document  = $(document).width(),
                el_close    = $('<div class="el-popup-close attr-popup-close">X</div>'),
                el_overview = $('<div class="el-popup-overview">');

            el_overview.removeAttr('style').height( h_document ).width( w_document );

            if ( !$('.jQpup').is(":visible") ) {
                $this.appendTo("body").end().prepend( el_close ).wrap( el_overview );
            }
            $this.removeAttr('style');
            setTimeout(function () {
                $this.css({ 'margin-top' :  - ( $this.outerHeight( true ) / 2 ) } );
                $this.css({ 'margin-left': - ( $this.outerWidth ( true ) / 2 ) } );
            },100);

            $(window).resize(function()
            {
                h_document = $(document).height();
                w_document = $(document).width();
                $this.closest('.el-popup-overview').height( h_document ).width( w_document );
            });

            $this.closest('.el-popup-overview').click(function(e) {

                var el_click = $(e.target);

                if( el_click.hasClass('el-popup-overview') || el_click.hasClass('attr-popup-close') ){
                    $(window).off('resize');
                    el_close.remove();
                    $this.unwrap(el_overview).hide();
                }
                
            });

            $this.show();

        });
    };  

})(jQuery);

$(function () {

    // USE TECHNICAL@ OPEN MODULE IMG-UPLOADER
    var imgUploader = function(){

        var _$el  = $('#img-uploader'),                 // Select
            _$tpl = $('#img-uploader-template'),        // Template with img
            _attr = {
                    type:       _$el.attr('data-iu-type'),   // Get attr from select
                    url:       _$el.attr('data-iu-url'),
                    width:     _$el.attr('data-iu-width'),
                    minWidth:  _$el.attr('data-iu-min-dimension').split('x')[0] || 0,
                    minHeight: _$el.attr('data-iu-min-dimension').split('x')[1] || 0,
                    maxWidth:  _$el.attr('data-iu-max-dimension').split('x')[0] || 0,
                    maxHeight: _$el.attr('data-iu-max-dimension').split('x')[1] || 0,
                    height:    _$el.attr('data-iu-height'),
                    change:    ''                          // id for find option in select
                },
            _$to  = $('<div></div>',{ class:'clearfix', id:'fileApiUpload' }); // Container for append

         $(_$el).after(_$to);

        // Private method _
        var _events = function (){
            
            var $clear   = $('.img-uploader-delete'),
                $gallery = _$to.find('.img-uploader');

            $clear.on('click', function (){
                var id = $(this).closest('.img-uploader').attr("data-iu-id");
                _$el.find('option[data-iu-option-id="'+id+'"]').val('').text('');
                _gallery();
            });

            // Save id for know what need $el replace
            $gallery.click(function () {
               _attr.change = $(this).attr('data-iu-id');
            });

        };

        // Generate list gallery from select
        var _gallery = function(){
            
            _$to.empty();

            _$el.find('option').each(function (index, item){
                
                if ($.isNumeric($(item).val())) $(item).val('');
                _$tpl.tmpl( { id: index, url: $(item).val() } ).appendTo( _$to );

                var img = $('.img-uploader[data-iu-id="'+index+'"]').find('img');
                if( img.attr('src') === ''){
                    var uploadText  = '<span class="inline-block" style="line-height:'+_attr.height+'px">';
                        uploadText +=     '<span class="line-18 inline-block relative" style="top:8px;">';
                        uploadText +=         'Загрузить <br> изображение';
                        uploadText +=     '</span>';
                        uploadText += '</span>';
                    $(img).replaceWith(uploadText);
                }
                
                // add id to option & text from value
                $(item).attr('data-iu-option-id',index).text( $(item).val() );
            });

            _$to.find('.img-uploader > span').css({'width':_attr.width, 'height':_attr.height});

            _events();
        };

        _gallery();

        _$to.fileapi({
            url: _attr.url,
            data: { 'typeId': _attr.type, 'siteId': 1 },
            multiple: false,
            imageSize: {
                minWidth: 50,
                minHeight: 50
            },
            accept: 'image/*',
            clearOnComplete: true,
            maxSize: FileAPI.MB*10, // max file size
            onComplete: function(evt, uiEvt) {
                var msg = uiEvt.result.message;
                if( uiEvt.result.code === 'success' ){
                    _$el.find('option[data-iu-option-id="'+_attr.change+'"]').val(msg).text(msg).attr({'selected':'selected'});
                    _gallery();
                } else {
                    alert(msg);
                }
            },
            // CROP
            onSelect: function (evt, ui){

                var file = ui.files[0];
                if( file ){

                    var popup  = '<div class="js-img"></div>';
                        popup += '<div class="text-center offset-t-15">';
                        popup +=      '<div class="js-upload attr-popup-close">Upload</div>';
                        popup += '</div>';

                    $(".jQpup").empty().append(popup).jQpup();

                    $('.js-upload').on('click', function (){
                        _$to.fileapi('upload');
                    });

                    $('.js-img').cropper({
                        file: file,
                        bgColor: '#fff',
                        maxSize: [ _attr.maxWidth, _attr.maxHeight ],
                        minSize: [ _attr.minWidth, _attr.minHeight],
                        selection: '90%',
                        onSelect: function (coords){
                            _$to.fileapi('crop', file, coords);
                        }
                    });

                }

            }

        });

    }();

});