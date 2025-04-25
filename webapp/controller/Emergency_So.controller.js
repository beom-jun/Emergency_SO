sap.ui.define([
    "sap/ui/core/mvc/Controller", 'sap/m/MessageToast', 
    'sap/ui/model/Filter', "sap/ui/model/FilterOperator"

], (Controller, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("emergencyso.emergencyso.controller.Emergency_So", {
        onInit: function () {

             let oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/SAP/ZGWC102_SDORDER_SRV/");// 바인딩 받은 엔티티들 세팅팅
             this.getView().setModel(oModel); // alias 없이 기본 모델로 설정

             //자재번호 설치헬프 임의로 넣어줌
             const aMaterialList = [
              { Matnr: "M0001", Maktx: "닭" },
              { Matnr: "M0002", Maktx: "탑코트" },
              { Matnr: "M0003", Maktx: "실란트" },
              { Matnr: "M0004", Maktx: "LA갈비" }
            ];

            //요청 BP 번호 설치헬프 임의로 넣어줌
            const aPartnerList = [
              { Partner: "BP01", Partxt: "A사" },
              { Partner: "BP02", Partxt: "B사" },
              { Partner: "BP03", Partxt: "C사" }
            ];

            const oJsonModel = new sap.ui.model.json.JSONModel({ MaterialSet: aMaterialList,
                                                                 PartnerSet : aPartnerList });
             
            this.getView().setModel(oJsonModel, "local");

          },
          onRefresh(){ //초기화
            this.getView().byId('VbelnSo').setValue('');
            this.getView().byId('Partner').setValue('');
            this.getView().byId('Ortype').setValue('');
            this.getView().byId('Menge').setValue('');
            this.getView().byId('Audat').setValue('');
            this.getView().byId('Netwr').setValue('');

            this.getView().byId('Matnr').setValue('');
            this.getView().byId('Pequan').setValue(''); 
            this.getView().byId('Stprs').setValue(''); 
            this.getView().byId('Waers').setValue(''); 
        },
        onItem(){ //Route 설정
            let oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteitemSo")
        },
        onSearch: function () {
            const vVbelnSo = this.getView().byId('VbelnSo').getValue().trim()
            const oTable = this.getView().byId('DocuTable');
            const oBinding = oTable.getBinding('rows');
            const aFilter = [];

            if (vVbelnSo !== '') {
              const oFilter = new Filter({
                path: 'VbelnSo',
                operator: FilterOperator.Contains,
                value1: vVbelnSo
              });
              aFilter.push(oFilter);
            }
          
            oBinding.filter(aFilter);

            oBinding.attachEventOnce("dataReceived", function () {
              if (oBinding.getLength() === 0) {
                MessageToast.show("검색된 결과가 없습니다.");
              }
            });
            
             // 확인 로그
                console.log("Filtered row count (may be async):", oBinding.getLength());
                console.log("입력된 판매오더번호:", aFilter);
          },
        onCreate: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            oModel.setUseBatch(false); // 배치 OFF
          
            // 값 추출
            const sMatnr = oView.byId("Matnr").getValue();
            const sPartner = oView.byId("Partner").getValue();
            const sPequan = oView.byId("Pequan").getValue();
            const iPequan = parseInt(sPequan, 10);
            const sOrtype = oView.byId("Ortype").getValue();
            const sAudat = oView.byId("Audat").getValue(); // yyyy-mm-dd 형식으로 되어 있어야 함
          
            // 숫자 변환 실패 시 기본값 처리 (예: 0)
            if (isNaN(iPequan)) {
                MessageToast.show("수량(Pequan)은 숫자만 입력해야 합니다.");
                return;
              }
              
            const oPayload = {
                Cusno: "C10001",
                Partner: sPartner,
                Ortype: sOrtype,
                Audat: sAudat, // ✅ 형식: 2025-04-24
                SO_ORDER_ITEMSet: [
                  {
                    Matnr: sMatnr,
                    Cusno: "C10001",
                    Partner: sPartner,
                    Pequan: iPequan.toString() // ✅ Decimal은 문자열로
                  }
                ]
              };

          oModel.create("/SO_ORDERSet", oPayload, {
            success: function () {
              MessageToast.show("판매오더 생성 성공!");
          
              // 👉 테이블 자동 새로고침 (테이블 ID에 맞춰 수정)
              const oTable = oView.byId("soOrderTable");
              if (oTable) {
                const oBinding = oTable.getBinding("items");
                if (oBinding) {
                  oBinding.refresh();
                }
              }
            },
          
            error: function (oError) {
              MessageToast.show("생성 실패!");
              console.error(JSON.parse(oError.responseText));
            }
          });
        },
        onSuggestMaterial: function (oEvent) { //사용자 자재번호 검색 시 포함 언어 필터링
          const sValue = oEvent.getParameter("suggestValue");
          const oFilter = new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.Contains, sValue);
          const oInput = oEvent.getSource();
          oInput.getBinding("suggestionItems").filter([oFilter]);
        },
        onSuggestPartner: function (oEvent) { //사용자 BP번호 검색 시 포함 언어 필터링
          const sValue = oEvent.getParameter("suggestValue");
          const oFilter = new sap.ui.model.Filter("Partner", sap.ui.model.FilterOperator.Contains, sValue);
          const oInput = oEvent.getSource();
          oInput.getBinding("suggestionItems").filter([oFilter]);
        }

          
    });
});