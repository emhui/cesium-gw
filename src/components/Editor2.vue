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
      <a-button
        type="primary"
        icon="line"
        @click="btnDrawPolyline"
        :ghost="isPolylineMode"
      />
      <a-button
        type="primary"
        icon="gateway"
        @click="btnDrawPolygon"
        :ghost="isPolygonMode"
      />
      <a-button type="primary" icon="close" />
    </a-space>
  </div>
</template>

<script>
import DrawPoint from "../utils/DrawPoint.js";
import DrawPolyline from "../utils/DrawPolyline.js";
import DrawPolygon from "../utils/DrawPolygon.js";
export default {
  data() {
    return {
      defaultCursor: "default",
      crosschairCursor: "crosshair",
      isAddFeatureMode: false,
      clickPosition: null,
      isPolylineMode: false,
      isPolygonMode: false,
    };
  },
  mounted() {
    // this.clickEvent();
    // 初始化鼠标
    document.body.style.cursor = this.defaultCursor;
    this.drawPoint = new DrawPoint({
      viewer: window.cesiumViewer,
      Cesium: Cesium,
      callback: function (point) {
        console.log(point);
      },
    });
    this.drawPolyline = new DrawPolyline({
      viewer: window.cesiumViewer,
      Cesium: Cesium,
      callback: function (polyline) {
        console.log(polyline);
      },
    });
    var $this = this;
    this.drawPolygon = new DrawPolygon({
      viewer: window.cesiumViewer,
      Cesium: Cesium,
      callback: function (polygon, position) {
        // 获取的是笛卡尔坐标，我们需要转化成经纬度坐标
        $this.postAddFeature(position)
      },
    });
  },
  methods: {
    cartesianToCartographic(cartesian) {
      var cartographic = new Cesium.Cartographic.fromCartesian(cartesian);
      return Cesium.Math.toDegrees(cartographic.longitude);
      //, new Cesium.Math.toDegrees(cartographic.latitude)
    },
    addFeature() {
      var currentCursorType = document.body.style.cursor;
      // 开始编辑
      if (currentCursorType == this.defaultCursor) {
        document.body.style.cursor = this.crosschairCursor;
        this.isAddFeatureMode = true;
        console.log("开始编辑");
        this.drawPoint.startCreate();
      } else {
        document.body.style.cursor = this.defaultCursor;
        this.isAddFeatureMode = false;
        console.log("停止编辑");
        this.drawPoint.destroy();
      }
    },
    btnDrawPolyline() {
      var currentCursorType = document.body.style.cursor;
      // 开始编辑
      if (currentCursorType == this.defaultCursor) {
        document.body.style.cursor = this.crosschairCursor;
        this.isPolylineMode = true;
        this.drawPolyline.startCreate();
      } else {
        document.body.style.cursor = this.defaultCursor;
        this.isPolylineMode = false;
        console.log("停止编辑");
        this.drawPolyline.destroy();
      }
    },
    btnDrawPolygon() {
      var currentCursorType = document.body.style.cursor;
      // 开始编辑
      if (currentCursorType == this.defaultCursor) {
        document.body.style.cursor = this.crosschairCursor;
        this.isPolygonMode = true;
        this.drawPolygon.startCreate();
      } else {
        document.body.style.cursor = this.defaultCursor;
        this.isPolygonMode = false;
        console.log("停止编辑");
        this.drawPolygon.destroy();
      }
    },
    positionListToStr(position) {
      var positionList = [];
      position.forEach((cartesian) => {
        var cartographic = new Cesium.Cartographic.fromCartesian(cartesian);
        positionList.push(Cesium.Math.toDegrees(cartographic.latitude));
        positionList.push(Cesium.Math.toDegrees(cartographic.longitude));
      });
        var cartographic = new Cesium.Cartographic.fromCartesian(position[0]);
        positionList.push(Cesium.Math.toDegrees(cartographic.latitude));
        positionList.push(Cesium.Math.toDegrees(cartographic.longitude));
      return positionList.join(' ')
    },
    postAddFeature(position) {
      var $this = this
      var xml = this.xmlAddFeature(this.positionListToStr(position));
      console.log(xml);
      var config = {
        method: "post",
        url: "/geoserver/cesium/wms",
        // url: "http://localhost:8080/geoserver/cesium/wms",
        headers: {
          Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
          "Content-Type": "application/xml",
        },
        data: xml,
      };
      this.$axios(config)
        .then(function (response) {
          console.log(response);
          console.log(JSON.stringify(response.data));
          $this.drawPolygon.clear()
        })
        .catch(function (error) {
          console.log(error);
        });
    },
    xmlAddFeature(position) {
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
                                        ${position}
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