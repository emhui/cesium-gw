<template>
  <div id="feature-box" v-show="featureInfo">
    <div id="feature-content"></div>
    <div id="feature-control">
      <button @click="updateFeature">更新</button>
      <input v-model="featureName0" placeholder="姓名" />
    </div>
    <div id="feature-control">
      <button @click="deleteFeature">删除</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ["viewer"],
  data() {
    return {
      wfsUrl: "http://localhost:8080/geoserver/cesium/wms",
      currentFeatureId: -1,
      featureInfo: null,
      featureName0: "",
    };
  },
  mounted() {
    this.addWFS();
    this.clickEvent();
  },
  methods: {
    addWFS() {
      var wmsUrl = 'http://jp-tyo-dvm.sakurafrp.com:25155/geoserver/cesium/wms'
      var provider = new Cesium.WebMapServiceImageryProvider({
        // url: "http://localhost:8080/geoserver/cesium/wms",
        url: wmsUrl,
        layers: "cesium:cc-polyline",
        parameters: {
          transparent: true, //是否透明
          format: "image/png",
          srs: "EPSG:4326",
          styles: "",
        },
      });
      window.cesiumViewer.imageryLayers.addImageryProvider(provider);
      var provider1 = new Cesium.WebMapServiceImageryProvider({
        // url: "http://localhost:8080/geoserver/cesium/wms",
        url: wmsUrl,
        layers: "cesium:cc-point",
        // proxy: new Cesium.DefaultProxy("/proxy/"),
        parameters: {
          transparent: true, //是否透明
          format: "image/png",
          srs: "EPSG:4326",
          styles: "",
        },
      });
      window.cesiumViewer.imageryLayers.addImageryProvider(provider1);
      this.wfsprovider = provider;
    },
    clickEvent() {
      let viewer = window.cesiumViewer;
      let _ = this;
      let imageryProvider = this.wfsprovider;
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
            var level = _.getLevel(alti);
/*             console.log(movement, cartesian, cartographic, xy);
            console.log(Cesium.Math.toDegrees(cartographic.latitude), Cesium.Math.toDegrees(cartographic.longitude)); */
            if (imageryProvider.ready) {
              xy = imageryProvider.tilingScheme.positionToTileXY(
                cartographic,
                level,
                xy
              );
              var promise = imageryProvider.pickFeatures(
                xy.x,
                xy.y,
                level,
                cartographic.longitude,
                cartographic.latitude
              );
              Cesium.when(promise, function (data) {
                // 获取查询结果
                if (data.length) {
                  _.featureInfo = data[0];
                  console.log(_.featureInfo);
                  _.featureName0 = _.featureInfo.properties.NAME_0;
                  document.getElementById("feature-content").innerHTML =
                    data[0].description;
                } else {
                  _.featureInfo = null;
                  document.getElementById("feature-content").innerHTML =
                    "没有数据";
                }
              });
            }
          }
        }
      },
      Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    pickEntity(viewer, windowPosition) {
      var cartographic = Cesium.Cartographic.fromCartesian(windowPosition);
      console.log(cartographic);
      // this.wfsprovider.pickFeatures(x, y, level, longitude, latitude);
    },
    getLevel(height) {
      if (height > 48000000) {
        return 0;
      } else if (height > 24000000) {
        return 1;
      } else if (height > 12000000) {
        return 2;
      } else if (height > 6000000) {
        return 3;
      } else if (height > 3000000) {
        return 4;
      } else if (height > 1500000) {
        return 5;
      } else if (height > 750000) {
        return 6;
      } else if (height > 375000) {
        return 7;
      } else if (height > 187500) {
        return 8;
      } else if (height > 93750) {
        return 9;
      } else if (height > 46875) {
        return 10;
      } else if (height > 23437.5) {
        return 11;
      } else if (height > 11718.75) {
        return 12;
      } else if (height > 5859.38) {
        return 13;
      } else if (height > 2929.69) {
        return 14;
      } else if (height > 1464.84) {
        return 15;
      } else if (height > 732.42) {
        return 16;
      } else if (height > 366.21) {
        return 17;
      } else {
        return 18;
      }
    },
    updateFeature() {
      console.log(this.featureInfo);
      console.log(this.featureName0);
      console.log(this.xmlUpdate());
      /*       this.$axios
        .get(
          "http://localhost:8080/geoserver/cesium/wms?service=wfs&version=2.0.0&request=GetFeature&typeNames=cesium:0&count=3"
        )
        .then((res) => {
          console.log(res);
        })
        .catch((e) => {
          console.log(e);
        }); */
      var config = {
        method: "post",
        // url: "http://127.0.0.1:8080/geoserver/cesium/wms",
        // url: "http://localhost:8080/geoserver/cesium/wms",
        url: "/geoserver/cesium/wms",
        headers: {
          Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
          "Content-Type": "application/xml",
        },
        data: this.xmlUpdate(),
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
    xmlUpdate() {
      return `
      <wfs:Transaction
        version="2.0.2"
        service="WFS"
        xmlns="http://www.someserver.example.com/myns"
        xmlns:fes="http://www.opengis.net/fes/2.0"
        xmlns:wfs="http://www.opengis.net/wfs/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.opengis.net/wfs/2.0
                            http://schemas.opengis.net/wfs/2.0.02.0/wfs.xsd">
        <wfs:Update typeName="cesium:0">
            <wfs:Property>
                <wfs:ValueReference>NAME_0</wfs:ValueReference>
                <wfs:Value>${this.featureName0}</wfs:Value>
            </wfs:Property>
            <fes:Filter>
                <fes:ResourceId rid="${this.featureInfo.data.id}"/>
            </fes:Filter>
        </wfs:Update>
        </wfs:Transaction>
        `;
      // <wfs:Value>${this.featureName0}</wfs:Value>
      // <fes:ResourceId rid="${this.featureInfo.data.id}"/>
    },
    deleteFeature() {
      console.log(this.xmlDelete());
      var config = {
        method: "post",
        url: "/geoserver/cesium/wms",
        // url : "http://localhost:8080/geoserver/cesium/wms",
        headers: {
          Authorization: "Basic YWRtaW46Z2Vvc2VydmVy",
          "Content-Type": "application/xml",
        },
        data: this.xmlDelete(),
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
    xmlDelete() {
      return `
      <wfs:Transaction
        version="2.0.2"
        service="WFS"
        xmlns="http://www.someserver.example.com/myns"
        xmlns:fes="http://www.opengis.net/fes/2.0"
        xmlns:wfs="http://www.opengis.net/wfs/2.0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://schemas.opengis.net/wfs/2.0.02.0/wfs.xsd">
        <wfs:Delete typeName="cesium:0">
            <fes:Filter>
              <fes:ResourceId rid="${this.featureInfo.data.id}"/>
            </fes:Filter>
        </wfs:Delete>
      </wfs:Transaction>
      `;
    },
  },
};
</script>

<style >
#feature-box {
  position: fixed;
  left: 30px;
  top: 30px;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  color: white;
  border: 1px white;
  border-radius: 4px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}

#feature-control {
  color: #333;
}
</style>