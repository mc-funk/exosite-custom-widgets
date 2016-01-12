//With attempt at div wrapper
/**
 * Image Slider
 * @version 1.0.0
 */
/**
 *        1   2   3   4    5    6
 * width  228 492 756 1020 1284 1548
 * height 156 360 564 768  972  1176
 *
 * To configure this widget, complete the following:
 *  1. For each desired slide, add a string in each of the following arrays:
 *    - BLOCK_IMAGES: string with the image url in format "url('[IMG LINK]')"
 *    - BLOCK_TILES: string with title text to be displayed
 *    - BLOCK_CONTENTS: string including html that will wrap the data point to
 *       be fetched from the dataport. Each string must include a unique class.
 *  2. Configure function(container, portal) to fetch the appropriate data from
 *     the portal object and inset it into the html item with the corresponding
 *     class.
 */
(function(window, $, undefined, portal)
{
  "use strict";

  var ImageSlider = {},
      clearInterval = window.clearInterval,
      setInterval = window.setInterval;

  $.extend(ImageSlider,
  // constants
  {
    // Image size must not exceed the container size
    // Image size reference please see the table above
    BLOCK_IMAGES:
    [
      "url('https://placekitten.com/g/492/360')",
      "url('https://unsplash.it/492/360')"
    ],
    BLOCK_TITLES:
    [
      "<span class='title0'></span>",
      "<span class='title1'></span>"
    ],
    BLOCK_CONTENTS:
    [
      "<span class='data0'></span>",
      "<span class='data1'></span>"
    ],
    CLASS: "image-slider-",
    DURATION: "default", // "default", "slow", "fast", milliseconds
    EASING: "swing", // "linear", "swing"
    HEIGHT: 360, // image height
    INTERVAL: 7000, // milliseconds per slide
    ITEM_IMAGE: "/static/png/slideshow_point.png",
    ITEM_IMAGE_HOVER: "/static/png/slideshow_point_hover.png",
    WIDTH: 492 // image width
  },
  // variables
  {
    blockLength: undefined,
    blocks: undefined,
    container: $("<div/>"),
    index: 0,
    items: undefined,
    timer: undefined
  },
  // functions
  {
    // animate
    animate: function(prev, next)
    {
      $(ImageSlider.blocks[prev])
        .fadeToggle(ImageSlider.DURATION, ImageSlider.EASING);
      $(ImageSlider.blocks[next])
        .fadeToggle(ImageSlider.DURATION, ImageSlider.EASING);
      $(ImageSlider.items[prev])
        .children("." + ImageSlider.CLASS + "switch-image-hover")
          .fadeIn(ImageSlider.DURATION, ImageSlider.EASING);
      $(ImageSlider.items[next])
        .children("." + ImageSlider.CLASS + "switch-image-hover")
          .fadeOut(ImageSlider.DURATION, ImageSlider.EASING);
    },
    // hide
    hide: function()
    {
      ImageSlider.container
        .closest(".content")
          .css("border", "none")
          .siblings(".title")
            .css("display", "none")
            .closest(".block")
              .css(
              {
                "background": "none",
                "border": "none"
              });
    },
    // html
    html: function()
    {
      var anchors,
          blocks,
          html;

      html = "<div class='" + ImageSlider.CLASS + "wrapper'>";
      for (blocks = 0; blocks < ImageSlider.BLOCK_IMAGES.length; blocks++)
      {
        html += "<div class='" + ImageSlider.CLASS + "block'>"
          + "<span class='" + ImageSlider.CLASS + "block-text'>"
          + "<p class='" + ImageSlider.CLASS + "block-title title" + blocks + "''>"
          + "</p><p class='" + ImageSlider.CLASS + "block-contents data" + blocks + "'>"
          + "</p></span></div>";
      }
      html += "</div>"
        + "<ul class='" + ImageSlider.CLASS + "switch-list'>";
      for (blocks = 0; blocks < ImageSlider.BLOCK_IMAGES.length; blocks++)
      {
        html += "<li class='" + ImageSlider.CLASS + "switch-list-item'>"
          + "<a class='" + ImageSlider.CLASS + "switch-anchor' href='#'>"
          + "<img class='" + ImageSlider.CLASS + "switch-image' "
          +   "src='" + ImageSlider.ITEM_IMAGE_HOVER + "' />"
          + "<img class='"
          +   ImageSlider.CLASS + "switch-image "
          +   ImageSlider.CLASS + "switch-image-hover' "
          +   "src='" + ImageSlider.ITEM_IMAGE + "' />"
          + "</a>"
          + "</li>";
      }
      html += "</ul>";

      return html;
    },
    // initialize
    initialize: function()
    {
      ImageSlider.container
        .html(ImageSlider.html());
      ImageSlider.blocks = ImageSlider.container
        .find("." + ImageSlider.CLASS + "block");
      ImageSlider.items = ImageSlider.container
        .find("." + ImageSlider.CLASS + "switch-anchor");
      ImageSlider.blockLength = ImageSlider.blocks.length;
      ImageSlider.script();
      $(ImageSlider.blocks[ImageSlider.index])
        .css("display", "block");
      $(ImageSlider.items[ImageSlider.index])
        .children("." + ImageSlider.CLASS + "switch-image-hover")
          .css("display", "none");
      ImageSlider.timer = setInterval(ImageSlider.slide, ImageSlider.INTERVAL);
    },
    // css & event
    script: function()
    {
      ImageSlider.container
        .css(
        {
          "height": ImageSlider.HEIGHT,
          "overflow": "hidden",
          "width": ImageSlider.WIDTH
        })
        .find("." + ImageSlider.CLASS + "wrapper")
          .css(
          {
            "height": ImageSlider.HEIGHT,
            "overflow": "hidden",
            "width": ImageSlider.WIDTH
          })
          .end()
        .find("." + ImageSlider.CLASS + "block")
          .css(
          {
            "background-position": "center center",
            "background-repeat": "no-repeat",
            "display": "none",
            "height": "100%",
            "left": "0",
            "overflow": "hidden",
            "position": "absolute",
            "top": "0",
            "width": "100%"
          })
          .each(function(i, e)
          {
            $(e)
              .css("background-image", ImageSlider.BLOCK_IMAGES[i]);
          })
          .end()
        .find("." + ImageSlider.CLASS + "block-text")
          .css(
            {
              "background-color": "#aaaaaa",
              "left": "1em",
              "margin": "0",
              "padding": "0 15px 0 15px",
              "position": "absolute",
              "top": "15em"
            })
        .end()
        .find("." + ImageSlider.CLASS + "block-title")
          .css(
          {
            "color": "#ff00c7",
            "font-weight": "bold",
            "margin-bottom": "5px"
          })
          .end()
          .find("." + ImageSlider.CLASS + "block-contents")
            .css(
            {
              "color": "#000000",
              "margin-top": "0"
            })
            .end()
        .find("." + ImageSlider.CLASS + "switch-list")
          .css(
          {
            "list-style": "none",
            "margin": "0",
            "padding": "0",
            "position": "absolute",
            "right": "0",
            "top": "4px"
          })
          .end()
        .find("." + ImageSlider.CLASS + "switch-list-item")
          .css(
          {
            "float": "left",
            "margin-right": "4px"
          })
          .end()
        .find("." + ImageSlider.CLASS + "switch-anchor")
          .css(
          {
            "height": "15px",
            "float": "left",
            "outline": "none",
            "position": "relative",
            "text-decoration": "none",
            "width": "12px"
          })
          .hover(function(e)
          {
            if (e.currentTarget === ImageSlider.items[ImageSlider.index])
            {
              return;
            }
            $(e.currentTarget)
              .find("." + ImageSlider.CLASS + "switch-image-hover")
                .fadeOut(ImageSlider.DURATION, ImageSlider.EASING);
          }, function(e)
          {
            if (e.currentTarget === ImageSlider.items[ImageSlider.index])
            {
              return;
            }
            $(e.currentTarget)
              .find("." + ImageSlider.CLASS + "switch-image-hover")
                .fadeIn(ImageSlider.DURATION, ImageSlider.EASING);
          })
          .each(function(i, e)
          {
            $(e)
              .click(function(e)
              {
                e.preventDefault();
                if (i === ImageSlider.index)
                {
                  return;
                }
                ImageSlider.animate(ImageSlider.index, i);
                ImageSlider.index = i;
                clearInterval(ImageSlider.timer);
              });
          })
          .end()
        .find("." + ImageSlider.CLASS + "switch-image")
          .css(
          {
            "height": "15px",
            "left": "0",
            "position": "absolute",
            "top": "0",
            "width": "12px"
          });
    },
    // slide
    slide: function()
    {
      var index;

      index = ImageSlider.index;
      ImageSlider.index++;
      ImageSlider.index %= ImageSlider.blockLength;
      ImageSlider.animate(index, ImageSlider.index);
    }
  });

  ImageSlider.initialize();
  //ImageSlider.hide();

  return function(container, portal)
  {
    var resources = [],
        i, j,
        data, unit, name, meta,

    container = $(container);

    // collect data sources for easy iteration.
    resources = resources.concat(portal.dataports);
    for (i = 0; i < portal.clients.length; i++)
      resources = resources.concat(portal.clients[i].dataports);

    // return if no data sources are selected.
    if (!resources.length)
      return;

    $(container)
      .html(ImageSlider.container)
      .closest(".widget")
        .find(".refreshIcon")
          .css("display", "none");

    console.log(resources);
    
    var portalJSON = JSON.stringify(resources, null, 2);

    for (j = 0; j < resources.length; j++) {
      console.log("resources " + j + ":", resources[j])
      data = resources[j]['data'][0][1];
      meta = resources[j]['info']['description']['meta'];
      meta = JSON.parse(meta);
      unit = meta['datasource']['unit'] || '';
      name = resources[j]['info']['description']['name'];

      console.log('meta: ', meta);
      console.log('unit: '+ unit);

      $(container).find('.data' + j) 
        .html("<strong>" + name + ":</strong> " + data + " " + unit);
    }
    

    function tempF(celsius) {
      return celsius * 9/5 + 32;
    }

  };
})(window, jQuery);
