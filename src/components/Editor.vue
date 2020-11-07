<template>
  <div id="editor-box">
    <a-space>
      <a-button type="primary" icon="search" />
      <a-button type="primary" icon="edit" />
      <a-button
        type="primary"
        icon="plus"
        @click="addFeature"
        :ghost="isAddFeatureMode"
      />
      <a-button type="primary" icon="close" />
    </a-space>
  </div>
</template>

<script>
import {DrawPoint} from '../utils/DrawPoint'
export default {
  data() {
    return {
      defaultCursor: "default",
      crosschairCursor: "crosshair",
      isAddFeatureMode: false,
      clickPosition: null,
    };
  },
  mounted() {
    // this.clickEvent();
  },
  methods: {
    addFeature() {
      var currentCursorType = document.body.style.cursor;
      // 开始编辑
      if (currentCursorType == this.defaultCursor) {
        document.body.style.cursor = this.crosschairCursor;
        this.isAddFeatureMode = true;
        this.postAddFeature()
      } else {
        document.body.style.cursor = this.defaultCursor;
        this.isAddFeatureMode = false;
      }
    },
    xmlAddFeature() {
      return `
        <wfs:Transaction version="2.0.2" service="WFS"
        xmlns:cesium="http://geoserver.org/cesium"
        xmlns="http://localhost:8080/geoserver/cesium"
        xmlns:gml="http://www.opengis.net/gml/3.2"
        xmlns:wfs="http://www.opengis.net/wfs/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 		 
        xsi:schemaLocation="
        http://www.opengis.net/wfs/2.0 
        http://localhost:8080/geoserver/schemas/wfs/2.0/wfs.xsd 
        http://geoserver.org/cesium http://localhost:8080/geoserver/cesium/wfs?service=WFS&amp;version=2.0.0&amp;request=DescribeFeatureType&amp;typeName=cesium%3A0 
        http://www.opengis.net/gml/3.2 http://localhost:8080/geoserver/schemas/gml/3.2.1/gml.xsd">
        <wfs:Insert>
            <cesium:0 gml:id="0.133">
                <cesium:the_geom>
                    <gml:MultiSurface srsName="urn:ogc:def:crs:EPSG::4326" srsDimension="2" gml:id="0.133.the_geom">
                        <gml:surfaceMember>
                            <gml:Polygon gml:id="0.133.the_geom.1">
                                <gml:exterior>
                                    <gml:LinearRing>
                                        <gml:posList>
                                        57.314902 76.535481
                                        69.477704 125.987415
                                        65.328445 93.011329
                                        57.314902 76.535481
                                        </gml:posList>
                                    </gml:LinearRing>
                                </gml:exterior>
                            </gml:Polygon>
                        </gml:surfaceMember>
                    </gml:MultiSurface>
                </cesium:the_geom>
                <cesium:GID_0>CHN</cesium:GID_0>
                <cesium:NAME_0>China</cesium:NAME_0>
                <cesium:GID_1>CHN.13_1</cesium:GID_1>
                <cesium:NAME_1>Hubei</cesium:NAME_1>
                <cesium:NL_NAME_1>湖北</cesium:NL_NAME_1>
                <cesium:GID_2>CHN.13.2_1</cesium:GID_2>
                <cesium:NAME_2>Ezhou by emhui</cesium:NAME_2>
                <cesium:VARNAME_2>Èzhōu</cesium:VARNAME_2>
                <cesium:NL_NAME_2>鄂州市</cesium:NL_NAME_2>
                <cesium:TYPE_2>Dìjíshì</cesium:TYPE_2>
                <cesium:ENGTYPE_2>Prefecture City</cesium:ENGTYPE_2>
                <cesium:CC_2/>
                <cesium:HASC_2/>
            </cesium:0>
        </wfs:Insert>
    </wfs:Transaction>
      `;
    },
    postAddFeature() {
      console.log(this.xmlAddFeature());
      var config = {
        method: "post",
        // url: "http://127.0.0.1:8080/geoserver/cesium/wms",
        // url: "http://localhost:8080/geoserver/cesium/wms",
        url: "/geoserver/cesium/wms",
        headers: {
          Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
          "Content-Type": "application/xml",
        },
        data: this.xmlAddFeature(),
      };
      this.$axios(config)
        .then(function (response) {
          console.log(response);
          console.log(JSON.stringify(response.data));
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    clickEvent() {
      let viewer = window.cesiumViewer;
      let _ = this;
      viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(
        movement
      ) {
        const ray = viewer.camera.getPickRay(movement.position);
        const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
        if (cartesian) {
          var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
          if (cartographic) {
            var xy = new Cesium.Cartesian2();
            var alti = viewer.camera.positionCartographic.height;
            // var level = _.getLevel(alti);
            console.log(cartographic);
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
  },
};
</script>

<style scoped>
#editor-box {
  position: fixed;
  right: 10px;
  top: 20px;
  z-index: 1000;
  background: rgba(0, 100, 255, 0.6);
  padding: 4px;
  color: white;
  border: 1px white;
  border-radius: 4px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}
</style>