sap.ui.define([
    "sap/ui/core/mvc/Controller", 'sap/m/MessageToast', 
    'sap/ui/model/Filter', "sap/ui/model/FilterOperator"

], (Controller, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("emergencyso.emergencyso.controller.Emergency_So", {
        onInit: function () {

             let oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/SAP/ZGWC102_SDORDER_SRV/");// 바인딩 받은 엔티티들 세팅팅
             this.getView().setModel(oModel); // alias 없이 기본 모델로 설정

             //엔터 이벤트
             this.getView().byId("VbelnSo").attachBrowserEvent("keypress", function (event) {
              if (event.key === "Enter") { 
                  this.onSearch();
              }
            }.bind(this));
        
            this.getView().byId("Partner2").attachBrowserEvent("keypress", function (event) {
                if (event.key === "Enter") { 
                    this.onSearch();
                }
            }.bind(this));

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
            this.getView().byId('Scost').setValue('');
            this.getView().byId('Waers').setValue(''); 
        },
        // onItem(){ //Route 설정
        //     let oRouter = this.getOwnerComponent().getRouter();
        //     let oModel = this.getView().getModel();

        //     oModel.refresh(true);

        //     oRouter.navTo("RouteitemSo")
        // },
        onItem: function() {
          let oRouter = this.getOwnerComponent().getRouter();
          let oTable = this.getView().byId("DocuTable");
          let aSelectedIndices = oTable.getSelectedIndices();  // 첫 번째 선택된 Row
      
          if (aSelectedIndices.length === 0) {
              sap.m.MessageToast.show("조회를 원하는 판매오더를 선택해주세요.");
              return;
          }
      
          const iSelectedIndex = aSelectedIndices[0]; // 첫 번째 선택된 행 인덱스
          const oContext = oTable.getContextByIndex(iSelectedIndex); // 인덱스로 Context 가져오기
          const sVbelnSo = oContext.getObject().VbelnSo; // context에서 데이터 읽기
      
          // VbelnSo를 파라미터로 넘기면서 이동
          oRouter.navTo("RouteitemSo", { VbelnSo: sVbelnSo });
      },
        onSearch: function () {
            const vVbelnSo = this.getView().byId('VbelnSo').getValue().toUpperCase();
            const vPartner = this.getView().byId('Partner2').getValue().toUpperCase();
            // const vCusno = this.getView().byId('Cusno').getValue();

            let otable   = this.getView().byId('DocuTable'), //테이블 받아오기
                oBinding = otable.getBinding('rows'), //검색 객체
                oFilter  = null, //검색어를 구성하는 객체
                aFilter  = []; //검색어를 받을 배열

              // if (!vVbelnSo && !vPartner) {
              //   oBinding.filter([]); //  필터 없이 전체 데이터 보여줌
              //   return;
              // }

              if (!vVbelnSo && !vPartner) {
                oBinding.filter([]);            // 필터 제거
                oBinding.refresh(true);         // 서버에서 전체 데이터 다시 요청
                return;
            }

            // Filter 구성
            if(vVbelnSo!= ''){
              oFilter = new Filter({
                  path: 'VbelnSo' ,
                  operator: FilterOperator.Contains,
                  value1: vVbelnSo
              });

              aFilter.push(oFilter);
              oFilter = null;
            }

            if(vPartner!= ''){
              oFilter = new Filter({
                  path: 'Partner' ,
                  operator: FilterOperator.Contains,
                  value1: vPartner
              });

              aFilter.push(oFilter);
              oFilter = null;
            }

            aFilter.push(new Filter({
              path: 'Cusno',
              operator: FilterOperator.EQ,
              value1: 'C10001'
            }));
          
            oBinding.filter(aFilter);
            
             // 확인 로그
                // console.log("Filtered row count (may be async):", oBinding.getLength());
                // console.log("입력된 판매오더번호:", aFilter);
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
          
            if ( !sMatnr || !sPartner || !sPequan || !sAudat ){
              MessageToast.show("모두 입력해야 생성이 가능합니다!");
              return;
            }

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
        },

        onInputChanged: function (oEvent) { //사용자가 검색 input 비울 시 전체 데이터 렌더링
          const sValue = oEvent.getParameter("value").trim();
          const oTable = this.getView().byId("DocuTable");
          const oBinding = oTable.getBinding("rows");
      
          if (sValue === "") {
              oBinding.filter([]);       // 전체 데이터 보여주기
              oBinding.refresh(true);    // 서버에서 다시 가져오기
          }
      },
        onInputChanged2: function (oEvent) {
          const sValue = oEvent.getParameter("value").trim();
          const oTable = this.getView().byId("DocuTable");
          const oBinding = oTable.getBinding("rows");
      
          if (sValue === "") {
              oBinding.filter([]);       // 전체 데이터 보여주기
              oBinding.refresh(true);    // 서버에서 다시 가져오기
          }
      }
          
    });
});