/**
 * 高亮feature元素的使用示例
 * */ 

import GeoJSON from '../src/ol/format/GeoJSON.js';
import Map from '../src/ol/Map.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import View from '../src/ol/View.js';
import {Fill, Stroke, Style, Text} from '../src/ol/style.js';

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
});

const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: 'data/geojson/countries.geojson',
    format: new GeoJSON(),
  }),
  style: function (feature) {
    style.getText().setText(feature.get('name'));
    return style;
  },
});

const map = new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});

const highlightStyle = new Style({
  stroke: new Stroke({
    color: '#f00',
    width: 1,
  }),
  fill: new Fill({
    color: 'rgba(255,0,0,0.1)',
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#f00',
      width: 3,
    }),
  }),
});

// 在这里新建了一个高亮图层，如果存在多个图层需要确保高亮图层位于其他图层的上方
const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,//在这里绑定了地图，也可以在外面用map.addLayer(featureOverlay)
  style: function (feature) {
    // 在这里动态地修改highlightStyle中Text中会显示的文字
    highlightStyle.getText().setText(feature.get('name'));
    return highlightStyle;
  },
});

// 当前位于高亮图层的元素
let highlight;
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.getId() + ': ' + feature.get('name');
  } else {
    info.innerHTML = '&nbsp;';
  }

  // 将当前获取到的元素与原高亮元素对比
  if (feature !== highlight) {
    // 如果高亮图层存在高亮元素，那么需要清除原来高亮显示的元素
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    // 如果该pixel存在feature，将其复制一份到高亮图层进行显示
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

map.on('pointermove', function (evt) {
  // 如果鼠标移动伴随着地图的拖拽行为，那么不要进行高亮
  if (evt.dragging) {
    return;
  }
  const pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});
