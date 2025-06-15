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
        
            // this.getView().byId("Partner2").attachBrowserEvent("keypress", function (event) {
            //     if (event.key === "Enter") { 
            //         this.onSearch();
            //     }
            // }.bind(this));

             //자재번호 설치헬프 임의로 넣어줌
             const aMaterialList = [
              { Matnr: "M0001", Maktx: "포장소고기" },
              { Matnr: "M0002", Maktx: "LA갈비" },
              { Matnr: "M0003", Maktx: "콩고기 순두부찌개" },
              { Matnr: "M0004", Maktx: "포장 돼지고기" },
              { Matnr: "M0005", Maktx: "포장 닭고기" },
              { Matnr: "M0006", Maktx: "도가니탕" },
              { Matnr: "M0007", Maktx: "치킨너겟" },
              { Matnr: "M0008", Maktx: "콩고기 햄 통조림" },
              { Matnr: "M0009", Maktx: "할랄 소갈비 밀키트" },
            ];

            const oLocalModel = new sap.ui.model.json.JSONModel();
                  oLocalModel.setData({ MaterialSet: aMaterialList });
                  this.getView().setModel(oLocalModel, "local"); 

            //요청 BP 번호 설치헬프 임의로 넣어줌
            const aPartnerList = [
              //신선 완제품 BP번호호
              { Partner: "BP0009", Partxt: "A사" },
              { Partner: "BP0010", Partxt: "B사" },
              { Partner: "BP0011", Partxt: "C사" },
              { Partner: "BP0012", Partxt: "C사" },
              { Partner: "BP0013", Partxt: "C사" },
              { Partner: "BP0014", Partxt: "C사" },
              { Partner: "BP0015", Partxt: "C사" },

              //가공 완제품 BP번호
              { Partner: "BP0016", Partxt: "C사" },
              { Partner: "BP0017", Partxt: "C사" },
              { Partner: "BP0018", Partxt: "C사" },
              { Partner: "BP0019", Partxt: "C사" },
              { Partner: "BP0020", Partxt: "C사" },

              //비건 완제품 BP번호
              { Partner: "BP0021", Partxt: "C사" },
              { Partner: "BP0022", Partxt: "C사" },

            ];

            // const oJsonModel = new sap.ui.model.json.JSONModel({ MaterialSet: aMaterialList,
            //                                                      PartnerSet : aPartnerList });
             
            // this.getView().setModel(oJsonModel, "local");

            const oJsonModel = new sap.ui.model.json.JSONModel({
                  MaterialSet: aMaterialList,
                  PartnerSet: aPartnerList,
                  FilteredPartnerSet: aPartnerList // 최초엔 전체 표시
                });
                this.getView().setModel(oJsonModel, "local");

            this._materialBpMap = {
                    "M0001": ["BP0009", "BP0010", "BP0015"],
                    "M0004": ["BP0009", "BP0011", "BP0013"],
                    "M0005": ["BP0011", "BP0014"],

                    "M0002": ["BP0012", "BP0016", "BP0019"],
                    "M0003": ["BP0012", "BP0016", "BP0020"],
                    "M0006": ["BP0012", "BP0017"],
                    "M0007": ["BP0012", "BP0018"],
                    "M0008": ["BP0012", "BP0018"],

                    "M0003": ["BP0012", "BP0016", "BP0020"],
                    "M0009": ["BP0022"]
                    
          };
            //요청일자 오늘 날짜 고정
            const oToday = new Date();
            const sToday = oToday.toISOString().slice(0, 10); // "YYYY-MM-DD" 형식

            this.byId("Audat").setValue(sToday); // DatePicker에 값 세팅
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

        onItem: function() { //Route 설정
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
            // const vPartner = this.getView().byId('Partner2').getValue().toUpperCase();
            // const vCusno = this.getView().byId('Cusno').getValue();

            let otable   = this.getView().byId('DocuTable'), //테이블 받아오기
                oBinding = otable.getBinding('rows'), //검색 객체
                oFilter  = null, //검색어를 구성하는 객체
                aFilter  = []; //검색어를 받을 배열

              if (!vVbelnSo && !vPartner) {
                oBinding.filter([]);            // 필터 제거
                oBinding.refresh(true);         // 서버에서 전체 데이터 다시 요청
                return;
            }

            if (!vVbelnSo) {
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

            // if(vPartner!= ''){
            //   oFilter = new Filter({
            //       path: 'Partner' ,
            //       operator: FilterOperator.Contains,
            //       value1: vPartner
            //   });

            //   aFilter.push(oFilter);
            //   oFilter = null;
            // }
          
            oBinding.filter(aFilter);
            
             // 확인 로그
                // console.log("Filtered row count (may be async):", oBinding.getLength());
                // console.log("입력된 BP번호호:", aFilter);
          },


        onCreate: function () {
            const oView = this.getView();
            const oModel = oView.getModel();
            oModel.setUseBatch(false); // 배치 OFF
          
            // 값 추출
            const sMatnr = oView.byId("Matnr").getValue();
            const sPartner = oView.byId("Partner").getValue();
            // const sCusno = oView.byId("Cusno").getValue(); //추가 06
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
                // Cusno: sCusno, //추가 06
                Partner: sPartner,
                Ortype: sOrtype,
                Audat: sAudat, //  형식: 2025-04-24
                SO_ORDER_ITEMSet: [
                  {
                    Matnr: sMatnr,
                    Cusno: "C10001",
                    // Cusno: sCusno,
                    Partner: sPartner,
                    Pequan: iPequan.toString() //  Decimal은 문자열로
                  }
                ]
              };

          oModel.create("/SO_ORDERSet", oPayload, {
            // success: function () {
            //   MessageToast.show("판매오더 생성 성공!");
          
            //   // 👉 테이블 자동 새로고침 (테이블 ID에 맞춰 수정)
            //   const oTable = oView.byId("soOrderTable");
            //   if (oTable) {
            //     const oBinding = oTable.getBinding("items");
            //     if (oBinding) {
            //       oBinding.refresh();
            //     }
            //   }

            success: function (oData) {
              MessageToast.show("판매오더 생성 성공!");

              const sNewOrder = oData.VbelnSo;
              this._sLastCreatedOrder = sNewOrder;

              const oTable = this.byId("DocuTable");
              const oBinding = oTable.getBinding("rows");
              if (oBinding) {
                oBinding.refresh();

                // 스크롤 맨 위로
                oTable.setFirstVisibleRow(0);

                // 렌더링 이후 강조
                  setTimeout(() => {
                    const aRows = oTable.getRows();
                    aRows.forEach(oRow => {
                      const oCtx = oRow.getBindingContext();
                      if (oCtx && oCtx.getProperty("VbelnSo") === sNewOrder) {
                        const oDomRef = oRow.getDomRef();
                        if (oDomRef) {
                          oDomRef.classList.add("highlightRow");

                          // 일정 시간 후 생성 css 클래스 제거
                          setTimeout(() => {
                            oDomRef.classList.remove("highlightRow");
                          }, 2000); // 2초 후 제거
                        }
                      }
                    });
                  }, 200);
                }

              oView.byId("Matnr").setValue("");
              oView.byId("Partner").setValue("");
              oView.byId("Pequan").setValue("");
              oView.byId("MatDesc").setText("");
            }.bind(this),
          
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
      },

        onMatnrChanged: function (oEvent) {
            const sInput = oEvent.getParameter("value").trim().toUpperCase();
            const oView = this.getView();
            const oLocalModel = oView.getModel("local");
            const aMaterials = oLocalModel.getProperty("/MaterialSet");

            const oMatch = aMaterials.find(item => item.Matnr === sInput);
            const sDesc = oMatch ? oMatch.Maktx : "";

            this.byId("MatDesc").setText(sDesc); // 자재명 표시

            // 자재번호에 따라 Partner 필터링
            const aFullPartnerList = oLocalModel.getProperty("/PartnerSet") || [];
            const aValidBpKeys = this._materialBpMap?.[sInput] || [];

            const aFilteredPartners = aFullPartnerList.filter(bp =>
                aValidBpKeys.includes(bp.Partner)
            );

            oLocalModel.setProperty("/FilteredPartnerSet", aFilteredPartners);

            // console.log("필터링된 BP 목록:", aFilteredPartners);
            // console.log("현재 자재번호:", sInput);
        }
          
    });
});