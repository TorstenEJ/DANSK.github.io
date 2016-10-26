
var lastMenuPoint = "0";
var menuHeight = 0;
var menuStart = 0;
var boolStartup = true;
var boolwidth = 0;
var intCounter = 0;
var UVM = {
    
    /*****************************************************************
	* funcInit
	* init initialisere and view objects 
	* @version 1.00, 2014-06-03
	* @author INGRAMA JKN
	*****************************************************************/
    funcInit: function () {
        
        this.setHeader();
        this.setTopimage();
        this.setLabelText();
        this.view.funcGetPages();
        // init page layout
        this.view.initPageLayout();


        var url = window.location.href; 
        var parts = url.split("id=");


        if (parts[1]) {
            if (parts[1].slice(-1) == '#') {
                parts[1] = parts[1].slice(0, -1);
            }
            $('body').css("font-size", "1em");
            this.view.funcLoadContent("1", "0"); //Show frontpage
            this.view.funcLoadMenu(3, 0); this.view.funcLoadContent(parts[1], "0"); //Show frontpage
        } else {
            this.view.funcLoadContent("1", "0"); //Show frontpage
        }
    },

    setHeader: function () {
        $('head').append('<link rel="stylesheet" href="css/video-player.css" type="text/css" />');
        $('head').append('<link rel="stylesheet" href="css/jquery-ui.css" type="text/css" />');
        $('head').append('<link rel="stylesheet" href="css/audio-player.css" type="text/css" />');

        browser = {};
        if ($(window).height() <= 800) boolwidth = 800;
        else boolwidth = 1160;

        if (navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/NOKIA/i)) {
            
            $('head').append('<link rel="stylesheet" href="css/style_' + $("body").attr("data-fag") + '_ios.css" type="text/css" />');
        } else { //if IE 9.
            $('head').append('<link rel="stylesheet" href="css/style_' + $("body").attr("data-fag") + '.css" type="text/css" />');
        }

    },

    setTopimage: function () {
        $('.top').append('<img src="images/top' + $("body").attr("data-fag") + '.jpg" />');
    },

    setLabelText: function () {
        
        $('#taskNumber').append($("body").attr("data-taskid"));
    }   
};


/**********************************************************
* UVM MODEL - View/dsiplay logic
**********************************************************/
/*  UVM object model - handle all html views    
 * 
 * @usage:
 * - init page layout, disable message "no scrips loaded", 
 * resize html markup, loads and display menu an taskinfo     
 * @version 1.00, 2014-06-01
 * @author INGRAMA JKN
 */

UVM.view = {
    /*****************************************************************
	* initPageLayout
	* init page layout, disable message "no scrips loaded", 
 	* resize html markup, loads and display menu an taskinfo
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
	*****************************************************************/
    initPageLayout: function () {

        // places and display menutree
        this.funcLoadMenu();
        this.funcDisableAll();
       // this.funcGetPages();
    }, 

    /*****************************************************************
   * funcGetPages
   * Collect all page id, parentid, title and contonts 
   * and define the pages parent children realtionship
   * @return array containing all page data and relationships
   * @version 1.00, 2014-06-01
   * @author INGRAMA JKN
   *****************************************************************/
   funcGetPages: function () {
       if (!this.arrPages) {
           // Create array
           var arrPages = [];
           // fill array with xml PAGE data 
           var i = 0;

           // Push all page information into array
           $(".PAGE").each(function () {


               var objPage = {
                   id: $(this).attr("data-id"),
                   parent_id: $(this).attr("data-parentid"),
                   title: $(this).attr("data-menutekst"),
                   layout: $(this).attr("data-layout"),
                   children: []
               };

               // Push the given page into the array
               arrPages.push(objPage);
               i++;
           });

           // Define children parent relation
           for (i = 0; i < arrPages.length; i++) {
               page = arrPages[i];
               // find all pages which is not rootpages

               if (page.parent_id != "0") {
                   for (var j = 0; j < arrPages.length; j++) {

                       var possible_parent = arrPages[j];
                       // find all pages corresponding  
                       if (possible_parent.id == page.parent_id) {
                           page.parent = possible_parent;
                           possible_parent.children.push(page);
                           
                           break;
                       }
                   }

               }
           }

           return arrPages;
       }
   },

    /*****************************************************************
	* funcGetPage
	* find the selected pages 
	* @param intiger intPageId -> The selected page Id
	* @return array containing the selected page data 
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
	*****************************************************************/
   funcGetPage: function (intPageId) {
       // finds the given page by sendt intPageId 
       for (var j = 0; j < this.funcGetPages().length; j++) {
           var arrPageData = this.funcGetPages()[j];
           if (arrPageData.id == intPageId) {
               return arrPageData;
           }
       }

       throw "Could not find a page with id '" + intPageId + "'";
   },
    /*****************************************************************
	* funcLoadMenu
	* Loads the menu links and sublink depending on which page the use has choosen
	* @param intiger intSelectedPageId -> Contain the id on the last selected pages 
	* @param intiger intSelectedPageParentId -> Contain the potentiel parent id of the last selected page   
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
	*****************************************************************/
   funcLoadMenu: function(intSelectedPageId, intSelectedPageParentId) {
        var strMenu = ""; // contain html for the treemenu
  		
        lastMenuPoint = $(".rootLinkActive").attr('id');

        // if no page are choosen
        if (!intSelectedPageId) {
            intSelectedPageId = "1"
        }
		
        // if no page are choosen
        if (!intSelectedPageParentId) {
            intSelectedPageParentId = "0"
        }

        var arrPages = this.funcGetPages();
        // loop and collect all rootpages
        for (var j = 0; j < arrPages.length; j++) {
            // get array containing all data on the given page ind the loop
            var arrPageData = arrPages[j];
           
            // define specefied page data in varibles
            var intRootPageId = arrPageData.id;
            var intRootPageParentId = arrPageData.parent_id;
            var intRootPageTitle = arrPageData.title; 
            var intRootLayout = arrPageData.layout;
            // Collect all rootpage link as html 
            strMenu += UVM.view.funcRenderRootmenu(intRootPageId, intRootPageParentId, intRootPageTitle, intSelectedPageId, intSelectedPageParentId, intRootLayout);
        }
  

        // parses the menu and content to the given containeres and adds classes to active root and sublink
        
        $('#menu').html(strMenu);



        $('#bottomMenu').html("<span class='subMenu' id='3' style='left: 0px;'><a onclick='UVM.view.funcLoadMenu(1, 1); UVM.view.funcLoadContent(1, 0);' target='_self' href='#'><img src='images/piltilbage.png' alt='' height='18'>TILBAGE</a></span>" + strMenu);
        // set classes on the active link
        this.funcSetActiveLinkClasses(intSelectedPageId,intSelectedPageParentId);
    }, 



    /*****************************************************************
    * funcRenderRootmenu
    * Collect all rootpages and subpages as HTML
    * @param intiger intRootPageId -> Contain the given pages id 
    * @param intiger intRootPageParentId -> Contain the given pages potential parent pages id 
    * @param intiger intRootPageTitle -> Contain the given pages title  
    * @param intiger intSelectedPageId -> Contain the id on the last selected pages 
    * @param intiger intSelectedPageParentId -> Contain the potentiel parent id of the last selected page   
    * @return string containing HTML
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
    *****************************************************************/
    funcRenderRootmenu: function (intRootPageId, intRootPageParentId, intRootPageTitle, intSelectedPageId, intSelectedPageParentId, intRootLayout) {
        // contain html for the tree menu
        var strMenu = "";
        // check for rootpages (if the page has no parent) 
        if (intRootPageParentId == 0) {
            if (intRootPageTitle == "") {
                strMenu += "<span id='" + intRootPageId + "' class='rootMenuMellemrum'><a onclick='UVM.view.funcLoadMenu(" + intRootPageId + "); UVM.view.funcLoadContent(" + intRootPageId + "," + intRootLayout + "); UVM.view.funcOnLoad(" + intRootPageId + ")' href='#' >" + intRootPageTitle + "</a></span>";
            } else {
                strMenu += "<span id='" + intRootPageId + "' class='rootMenu'><a onclick='UVM.view.funcLoadMenu(" + intRootPageId + "); UVM.view.funcLoadContent(" + intRootPageId + "," + intRootLayout + ");  UVM.view.funcOnLoad(" + intRootPageId + ")' href='#' >" + intRootPageTitle + "</a></span>";
            }

            var strSubMenu = UVM.view.funcRenderSubMenu(intRootPageId, intSelectedPageId, intSelectedPageParentId, intRootLayout);
            if (strSubMenu!= ""){
                strMenu += strSubMenu;
                strMenu += "<br/>"
            }
            strMenu += "<br/>";
        }
        return strMenu;
    }, 
	
	
    /*****************************************************************
    * funcRenderSubMenu
    * Collect all subpages the the given page as HTML
    * @param intiger intRootPageId -> Contain the given rootpages id 
    * @param intiger intSelectedPageId -> Contain the id on the last selected pages 
    * @param intiger intSelectedPageParentId -> Contain the potentiel parent id of the last selected page   
    * @return string containing HTML
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
    *****************************************************************/
    funcRenderSubMenu: function(intRootPageId, intSelectedPageId, intSelectedPageParentId, intRootLayout) {
    
        // Contain html for the tree menu
        var strMenu = "";
	
        var arrRootPage = this.funcGetPage(intRootPageId);
        // loops all children to the selected page 
        for (var i = 0; i < arrRootPage.children.length; i++) {
            var arrSubPageData = arrRootPage.children[i];
            
            // adds the submenu if the given the criteria is correkt    
            if ((intSelectedPageId == arrRootPage.id || intSelectedPageId == arrSubPageData.id || arrRootPage.id == intSelectedPageParentId) && arrSubPageData.layout == "0" && arrSubPageData.title != "") {
                
                strMenu += 	"<br/>&nbsp; &nbsp;" +
            			    "<span id='" + arrSubPageData.id + "' class='subMenu'>" +
                		    "<a onclick='UVM.view.funcLoadMenu(" + arrSubPageData.id + "," + intRootPageId + " ); UVM.view.funcLoadContent(" + arrSubPageData.id + "," + arrSubPageData.layout + ")' href='#' >" +
                   		    arrSubPageData.title + "</a></span>";
            }

            if ((intSelectedPageId == arrRootPage.id || intSelectedPageId == arrSubPageData.id || arrRootPage.id == intSelectedPageParentId) && arrSubPageData.layout == "1" && arrSubPageData.title != "") {

                strMenu += "<br/>&nbsp; &nbsp;" +
            			    "<span id='" + arrSubPageData.id + "' class='subMenu'>" +
                		    "<a onclick='UVM.view.funcLoadMenu(" + arrSubPageData.id + "," + intRootPageId + " ); UVM.view.funcLoadContent(" + arrSubPageData.id + "," + arrSubPageData.layout + ")' href='#' >" +
                   		    arrSubPageData.title + "</a></span>";
            }

            if ((intSelectedPageId == arrRootPage.id || intSelectedPageId == arrSubPageData.id || arrRootPage.id == intSelectedPageParentId) && arrSubPageData.layout == "2" && arrSubPageData.title != "") {

                strMenu += "<br/>&nbsp; &nbsp;" +
            			    "<span id='" + arrSubPageData.id + "' class='subMenu'>" +
                		    "<a onclick='UVM.view.funcLoadMenu(" + arrSubPageData.id + "," + intRootPageId + " ); UVM.view.funcLoadContent(" + arrSubPageData.id + "," + arrSubPageData.layout + ")' href='#' >" +
                   		    arrSubPageData.title + "</a></span>";
            }
	 
        }
	  
        return strMenu;
    },

    /*****************************************************************
	* funcLoadContent
	* get the selected pages content and parses it to the html markup
	* @param intiger intSelectedPageId -> Contain the id on the last selected pages   
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
	*****************************************************************/
    funcLoadContent: function (intSelectedPageId, pageLayout) {
        this.funcDisableAll();
        globalselectedPageId = intSelectedPageId;
        globalpageLayout = pageLayout;
        /* DISABLE ALL VIDEOS */
        $("video").each(function () {
            $(this).get(0).pause();
            
        });


        $(".play").each(function () {
            $(this).switchClass("play", "paused");
        });
       
        $("audio").each(function () {
            $(this).get(0).pause();
        });


        $(".audioplay").each(function () {
            $(this).switchClass("audioplay", "audiopaused");
        });
        

        if (pageLayout == "2") {

            var a = document.getElementById("pdfLink" + intSelectedPageId);

            setTimeout(function () {

                var mEvent = document.createEvent("MouseEvent");
                try {
                    mEvent.initMouseEvent("click", true, true, window, 0,
                        0, 0, 0, 0,
                        false, false, false, false,
                        0, null);

                    a.dispatchEvent(mEvent);


                } catch (e) {
                }
            }, 25);
            //document.getElementsByClassName("pdfLink")[0].click(); 
            lastMenuPoint = parseInt(lastMenuPoint) - 1;
            var arrPages = this.funcGetPages(lastMenuPoint);
            // get array containing all data on the given page ind the loop
            var arrPageData = arrPages[lastMenuPoint];
            UVM.view.funcLoadMenu(arrPageData.id);
            UVM.view.funcLoadContent(arrPageData.id, arrPageData.layout);
            return false;
        }
        if (pageLayout == "0") {

            this.funcSetupStandardPage();
            if (!intSelectedPageId) {
                intSelectedPageId = "1";
            }

            
            this.funcSetupStandardPage();
            // get the selected pages data as an array 
            var arrSelectedPageData = this.funcGetPage(intSelectedPageId);
            // contain selected pages content 
            
            $(".PAGE[data-id='" + arrSelectedPageData.id + "']").css("display", "table-cell");

            /*
            $(".PAGE[data-id='" + arrSelectedPageData.id + "']").find('.video-player').each(function () {
                videoPlayer($(this).attr("data-source"), $(this).attr("data-title"), "", "100", true, true, $(this)[0].id);

            });
            $("video").each(function () {
                $(this).get(0).preload = "none"
            });
            */

            var color = $(".PAGE[data-id='" + arrSelectedPageData.id + "']").attr("data-background");

            if (color) $("#content").css("background-color", color);
            else $("#content").css("background-color", "white");
            //this.funcSetActiveLinkClasses(intSelectedPageId, 0);
            // parses the content the given places in the HTML markup  
            //$('#content').html(strPageContent);


            result = 0;
            wantedheight = 0;
        }
        else {
            this.funcSetupFreestylePage();
           
            if (!intSelectedPageId) {
                intSelectedPageId = "1";
            }



            // get the selected pages data as an array 
            var arrSelectedPageData = this.funcGetPage(intSelectedPageId);
            var color = $(".PAGE[data-id='" + arrSelectedPageData.id + "']").attr("data-background");

            if (color) $("#content").css("background-color", color);
            else $("#content").css("background-color", "white");
            // contain selected pages content 
            //this.funcSetActiveLinkClasses(intSelectedPageId, 1);
            $(".PAGE[data-id='" + arrSelectedPageData.id + "']").css("display", "block");
        }



        UVM.view.funcOnLoad(intSelectedPageId);
    }, 
   /*****************************************************************
   * funcDisableAll
   * @version 1.00, 2014-06-01
   * @author INGRAMA JKN
   *****************************************************************/
    funcDisableAll: function () {

        var arrPages = this.funcGetPages();
        // loop and collect all rootpages
        for (var j = 0; j < arrPages.length; j++) {
            // get array containing all data on the given page ind the loop
            var arrPageData = arrPages[j];

            // define specefied page data in varibles
            var intRootPageId = arrPageData.id;
            var intRootPageParentId = arrPageData.parent_id;
            $(".PAGE[data-id='" + arrPageData.id + "']").css("display", "none");

            //todo. delete all videos.
            $(".video").each(function ()
            {
                $(this).remove();
            });

        }

    },
    /*****************************************************************
    * funcSetupFreestylePage
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
    *****************************************************************/
    funcSetupFreestylePage: function () {
        var spanWidth = 0;
        $(".top").css("display", "none");
        $("#menu").css("display", "none");
        $("#menuWrapper").css("display", "none");
        $("#uvmLogo").css("display", "none");
        $("#bottomMenu").css("display", "block");
        $(".wrapper").css("width", "100%");
        $(".main").css("width", "100%");
        $(".main").css("border", "0");
        $("#content").css("width", "100%");
        $("#content").css("margin-left", "0px");
        $(".PAGE").css("width", "100%");
        //DISABLE THE ROOT MENU!
        
        $("#bottomMenu .rootMenu").each(function () {
            $(this).css("display", "none");
        });

        $("#bottomMenu .subMenu").each(function () {

            $(this).css("left", spanWidth);
            spanWidth += $(this).width();
            spanWidth += 40;

        });
        
    },


    /*****************************************************************
    * funcSetupStandardPage
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
    *****************************************************************/
    funcSetupStandardPage: function () {

        var width = document.body.clientWidth;

        $(".top").css("display", "block");
        $("#menu").css("display", "block");
        $("#menuWrapper").css("display", "table-cell");
        $("#uvmLogo").css("display", "block");
        $("#bottomMenu").css("display", "none");
        $(".main").css("width", "66%");
        $(".main").css("border-left", "2px ridge lightgray");
        $(".main").css("border-right", "2px ridge lightgray");
        $("#content").css("width", "auto");
        $("#content").css("margin-left", "18%");
        $(".PAGE").css("width", "955px");
        if (width >= "1160" && boolwidth==1160) {
            $(".wrapper").css("width", boolwidth + "px");
            
        } else if ((width >= "800" && boolwidth == 800)) {
            $(".wrapper").css("width", boolwidth + "px");

        } else {
            $(".wrapper").css("width", "100%");
            //$(".subLinkActive").css("border", "0");
            //$(".subMenu").css("border", "0");
        }

        $(".main").css("width", "100%");
        $(".main").css("background", "white");
        //$("#content").css("width", "80%");
        //$("#content").css("margin-left", "20%");
    },

    /*****************************************************************
	* funcSetActiveLinkClasses
	* Gives all active menu links and "active" class atribute" related to the selectet page and it potential parent  
	* @param intiger intSelectedPageId -> Contain the id on the last selected page 
	* @param intiger intSelectedPageParentId -> Contain the potentiel parent id of the last selected page 
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
	*****************************************************************/
    funcSetActiveLinkClasses: function (intSelectedPageId, intSelectedPageParentId) {

        // if a subpage are choosen
        var first = true;
        $("#bottomMenu .subMenu").each(function () {

            if (first) {
                $(this).addClass("subMenu first");
                first = false;
            }   else if ($(this).get(0).id == intSelectedPageId) {
                $(this).addClass("subMenu subLinkActive");
            }

        });
        if (intSelectedPageParentId != 0) {

            if (document.getElementById("" + intSelectedPageId + "").setAttribute("class", "subMenu subLinkActive")) {
                // only "className" does work in IE6
                document.getElementById("" + intSelectedPageId + "").setAttribute("className", "subMenu subLinkActive");
            }
            if (document.getElementById("" + intSelectedPageParentId + "").setAttribute("class", "rootLinkActive")) {
                // only "className" does work in IE6
                document.getElementById("" + intSelectedPageParentId + "").setAttribute("className", "rootLinkActive");
            }
        }
            // if only rootpage is choosen
        else {
            if (!document.getElementById("" + intSelectedPageId + "").setAttribute("class", "rootLinkActive")) {
                // only "className" does work in IE6
                document.getElementById("" + intSelectedPageId + "").setAttribute("className", "rootLinkActive");
            }
        }
        
    },
    /*****************************************************************
     * funcLoadPlayer
     * Places the flashoplayer object and parses the given variables  
     * @param string strFileToStream -> Holds the filename of the .flv file to be streamed 
     * @param string strTitel -> Holds the titel of the .flv filed to be streamed 
     * @param string strStartImage -> Holds the filename of the images to be showned before .flv file is streamed 
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
     *****************************************************************/
    funcLoadPlayer: function (strFileToStream, strTitel, strStartImage, strWantedWidth) {
        var html = '<div id="blanketMovie">\n';
        html += '</div><div id="popUpDivMovie">\n';
        html += '<div id="closeDivLayerMovie"></div>\n'
        html += '</div>\n';

       
        $("body").prepend(html);

        if (!strWantedWidth) strWantedWidth = "60";

        videoPlayer(strFileToStream, strTitel, strStartImage, strWantedWidth, true);

        
        
        $("#blanketMovie").click(function () {
            UVM.view.funcDisablePlayer("2", strFileToStream);
        });

        $("#closeDivLayerMovie").click(function () {
            UVM.view.funcDisablePlayer("2", strFileToStream);
        });
    },

    /*****************************************************************
    * funcdisablePlayer
    * Places the flashoplayer object and parses the given variables  
    * @param string strFileToStream -> Holds the filename of the .flv file to be streamed 
    * @param string strTitel -> Holds the titel of the .flv filed to be streamed 
    * @param string strStartImage -> Holds the filename of the images to be showned before .flv file is streamed 
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
    *****************************************************************/
    funcDisablePlayer: function (strDivId, strFileToStream) {
        //disableVideo("popUpDiv");
        if (strDivId == "2") {
            $("#popUpDivMovie" + strFileToStream).each(function () {
                $(this).get(0).pause();
                delete (this);
                $(this).remove();
            });
            $("#blanketMovie").remove();
            $("#popUpDivMovie").remove();
        } else {

            $("#blanket").remove();
            $("#popUpDiv").remove();
        }
    },
    /*****************************************************************
    * funcLoadPopup
    * Places the flashoplayer object and parses the given variables  
    * @param string strFileToStream -> Holds the filename of the .flv file to be streamed 
    * @param string strTitel -> Holds the titel of the .flv filed to be streamed 
    * @param string strStartImage -> Holds the filename of the images to be showned before .flv file is streamed 
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
    *****************************************************************/
    funcLoadPopup: function (strId, width, height) {
        //disableVideo("popUpDiv");
        var html = '<div id="blanket">\n';
        html += '</div><div id="popUpDiv">\n';
        html += '<div id="closeDivLayer"></div>\n';
        html += '<div id="divContainer">\n';
        html += $("#" + strId).find(".popdiv").html();
        html += '</div>\n';
        html += '<div id="divTitle">\n';
        html += $("#" + strId).find(".popdivTitle").html();
        html += '</div>\n';
        html += '</div>\n';


        $("body").prepend(html);

        width = "80";
        $("#popUpDiv").css("width", width + "%");
        //$("#popUpDiv").css("height", height + "%");
        height = ($(window).height() / 100) * height;

        if ($(window).height() >= $(window).width()) {
            height = height;
        }

        //console.log("Height = " + height);
        $('#popUpDiv').css('height', height + "px");

        $("#blanket").click(function () {
            UVM.view.funcDisablePlayer("1");
        });

        $("#closeDivLayer").click(function () {
            UVM.view.funcDisablePlayer("1");
        });
    },

   /*****************************************************************
   * funcOnLoad
   * Places the flashoplayer object and parses the given variables  
   * @param string strFileToStream -> Holds the filename of the .flv file to be streamed 
   * @param string strTitel -> Holds the titel of the .flv filed to be streamed 
   * @param string strStartImage -> Holds the filename of the images to be showned before .flv file is streamed 
    * @version 1.00, 2014-06-01
    * @author INGRAMA JKN
   *****************************************************************/
    funcOnLoad: function (intSelectedPageId) {
    }
};


$(document).ready(function () {

 


    UVM.funcInit();
});




$(window).resize(function () {
    if (globalpageLayout == "0") {


        if (!globalwidth) {
            globalwidth = $(window).width();
        }

        if ($(window).height() <= 800) boolwidth = 800;
        else boolwidth = 1160;
        UVM.view.funcSetupStandardPage();

    }

    else if (globalpageLayout == "1") {


        if (!globalwidth) {
            globalwidth = $(window).width();
        }

        if ($(window).height() <= 800) boolwidth = 800;
        else boolwidth = 1160;
        UVM.view.funcSetupFreestylePage();

    }


    //refresh any video sizes
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/NOKIA/i)) {
        // get the selected pages data as an array 
        var arrSelectedPageData = UVM.view.funcGetPage(globalselectedPageId);
        // contain selected pages content 
        $('.videoframe').each(function () {
            var oldWidth = $("#" + this.id).width();
            var oldHeight = $("#" + this.id).height();

            if (globalpageLayout == "0") {
               
                if ((boolwidth == 800 && $(".main").width() >= boolwidth) || (boolwidth == 1160 && $(".main").width() >= boolwidth)) {
                    var newWidth = boolwidth - boolwidth * 0.20;

                } else {
                    var newWidth = $(".main").width() - $(".main").width() * 0.21;
                }

                var newHeight = newWidth * (480 / 768);
            } else if (globalpageLayout == "1") {
                var newWidth = $("#" + this.id).parent().parent().width();
                var newHeight = (newWidth / oldWidth) * oldHeight;
            }
            //console.log("oldWidth = " + oldWidth + "newWidth = " + newWidth + "main = " + $(".main").width());
            $("#" + this.id).attr("width", newWidth + "px");
            $("#" + this.id).attr("height", newHeight + "px");
            $("#" + this.id).parent().css("width", newWidth + "px");
            $("#" + this.id).parent().css("height", newHeight + "px");
           
        });

        $(".audio-player").each(function () {

            $("#" + this.id).css("width", ($(".main").width() - $(".main").width() * 0.25) + "px");

        });
    } else if (!(navigator.userAgent.match(/ANDROID/i))) {

        $('.videoframe').each(function () {
            if ($(window).width() < 800) {

                var sound = $("#videoduration" + this.id);

                sound.css("left", "-16%");
                sound.css("font-size", "1em");

                var sound = $("#videototal" + this.id);
                sound.css("right", "-16%");

            } else {
                var sound = $("#videoduration" + this.id);

                sound.css("left", "-11%");
                sound.css("font-size", "1em");

                var sound = $("#videototal" + this.id);
                sound.css("right", "-11%");

            }
        });
    }

    // get the selected pages data as an array 
    var arrSelectedPageData = UVM.view.funcGetPage(globalselectedPageId);

    //test for video size out of screen. 
    $("#popUpDivMovie").find('.videoframe').each(function () {

        if ($(window).height() <= $(window).width()) {
            var oldWidth = $("#" + this.id).width();
            var oldHeight = $("#" + this.id).height();
            var top = ($(window).height() / 100) * 8;
            var margin = 140;
            var currentHeight = margin + top + oldHeight;
            //resize video. 


            if ((currentHeight >= ($(window).height() + 20)) && !($(window).width() == $("#" + this.id).width())) {


                if (navigator.userAgent.match(/MSIE 10.0/i) || navigator.userAgent.match(/MSIE 9.0/i)) {
                    var newwidth = $("body").width() / 100 * 40;
                    var newheight = newwidth * (480 / 768);
                    //height = (height / 1160) * 100;
                    $("#" + this.id).parent().css("width", newwidth + 'px');
                    $("#" + this.id).parent().css("height", newheight + 'px' + "100px");

                    $("#" + this.id).attr("width", newwidth + "px");
                    $("#" + this.id).attr("height", newheight + "px");
                } else {
                    $("#" + this.id).parent().css("width", "40%");
                    var fontSize = 40 / 100;
                    var id = this.id;

                    if ($("#" + id).width() >= 700) {

                        $("#videoduration" + id).css("font-size", fontSize + "em");
                        $("#videototal" + id).css("font-size", fontSize + "em");

                        $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                        $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                        $("#title" + id).css("font-size", fontSize + "em");
                        $("#title" + id).css("top", "8%");

                    }
                    else {
                        fontSize = fontSize - (fontSize / 3);
                        $("#videoduration" + id).css("font-size", fontSize + "em");
                        $("#videototal" + id).css("font-size", fontSize + "em");

                        $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                        $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                        $("#title" + id).css("font-size", fontSize + "em");
                        $("#title" + id).css("top", "8%");

                    }
                }
            } else {
                var fontSize = 60 / 100;
                var id = this.id;

                if ($("#" + id).width() >= 700) {

                    $("#videoduration" + id).css("font-size", fontSize + "em");
                    $("#videototal" + id).css("font-size", fontSize + "em");

                    $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                    $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                    $("#title" + id).css("font-size", fontSize + "em");
                    $("#title" + id).css("top", "8%");

                }
                else {
                    fontSize = fontSize - (fontSize / 3);
                    $("#videoduration" + id).css("font-size", fontSize + "em");
                    $("#videototal" + id).css("font-size", fontSize + "em");

                    $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                    $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                    $("#title" + id).css("font-size", fontSize + "em");
                    $("#title" + id).css("top", "8%");

                }
            }

            
        } else if (!($(window).width() == $("#" + this.id).width())) {

            if (navigator.userAgent.match(/MSIE 10.0/i) || navigator.userAgent.match(/MSIE 9.0/i)) {
                var newwidth = $("bpdy").width() / 100 * 60;
                var newheight = newwidth * (480 / 768);
                //height = (height / 1160) * 100;
                $("#" + this.id).parent().css("width", newwidth + 'px');
                $("#" + this.id).parent().css("height", newheight + 'px' + "100px");

                $("#" + this.id).attr("width", newwidth + "px");
                $("#" + this.id).attr("height", newheight + "px");

                var fontSize = 60 / 100;
                var id = this.id;

                if ($("#" + id).width() >= 700) {

                    $("#videoduration" + id).css("font-size", fontSize + "em");
                    $("#videototal" + id).css("font-size", fontSize + "em");

                    $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                    $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                    $("#title" + id).css("font-size", fontSize + "em");
                    $("#title" + id).css("top", "8%");

                }
                else {
                    fontSize = fontSize - (fontSize / 3);
                    $("#videoduration" + id).css("font-size", fontSize + "em");
                    $("#videototal" + id).css("font-size", fontSize + "em");

                    $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                    $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                    $("#title" + id).css("font-size", fontSize + "em");
                    $("#title" + id).css("top", "8%");

                }
            }
            else if (navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/NOKIA/i)) {
                var newwidth = $("body").width() / 100 * 60;
                var newheight = newwidth * (480 / 768);
                //height = (height / 1160) * 100;
                $("#" + this.id).parent().css("width", newwidth + 'px');
                $("#" + this.id).parent().css("height", newheight + 'px');

                $("#" + this.id).attr("width", newwidth + "px");
                $("#" + this.id).attr("height", newheight + "px");


            } else if (!($(window).width() == $("#" + this.id).width())) {

                $("#" + this.id).parent().css("width", "60%");
                var fontSize = 60 / 100;
                var id = this.id;

                if ($("#" + id).width() >= 700) {

                    $("#videoduration" + id).css("font-size", fontSize + "em");
                    $("#videototal" + id).css("font-size", fontSize + "em");

                    $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                    $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                    $("#title" + id).css("font-size", fontSize + "em");
                    $("#title" + id).css("top", "8%");

                }
                else {
                    fontSize = fontSize - (fontSize / 3);
                    $("#videoduration" + id).css("font-size", fontSize + "em");
                    $("#videototal" + id).css("font-size", fontSize + "em");

                    $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                    $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                    $("#title" + id).css("font-size", fontSize + "em");
                    $("#title" + id).css("top", "8%");

                }
            }


        } else {
            var fontSize = 60 / 100;
            var id = this.id;

            if ($("#" + id).width() >= 700) {

                $("#videoduration" + id).css("font-size", fontSize + "em");
                $("#videototal" + id).css("font-size", fontSize + "em");

                $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                $("#title" + id).css("font-size", fontSize + "em");
                $("#title" + id).css("top", "8%");

            }
            else {
                fontSize = fontSize - (fontSize / 3);
                $("#videoduration" + id).css("font-size", fontSize + "em");
                $("#videototal" + id).css("font-size", fontSize + "em");

                $("#videoduration" + id).css("bottom", "-" + fontSize / 2 + "em");
                $("#videototal" + id).css("bottom", "-" + fontSize / 2 + "em");

                $("#title" + id).css("font-size", fontSize + "em");
                $("#title" + id).css("top", "8%");

            }
        }
    });
});

var globalwidth, globalselectedPageId, globalpageLayout, html;

if (window.addEventListener) {
    window.addEventListener("load", doLoad, false);
}
else {
    if (window.attachEvent) {
        window.attachEvent("onload", doLoad);
    } else
        if (window.onLoad) {
            window.onload = doLoad;
        }
}


function doLoad() {
    
    $('body').flowtype({
    });

    videoPlayer("", "", "", "", false);
    initAudio();
    $("body").css("background-image", "url(images/bg.jpg)");
    $("body").css("background-repeat", "repeat-x");
    $("body").css("background-position", "top");
    $("body").css("visibility", "visible");
}