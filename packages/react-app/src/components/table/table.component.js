import React from "react";
import MaterialTable from "material-table";
import Loader from 'react-loader-spinner'

import { StyledDiv, Wrapper, ColumnWrapper, CenterWrapper } from "./table.styles"
import { Card } from "../index";


const Table = () => {

    let data = [
        {
            id: 1,
            endDate: 1780,
            listprice: 250000, 
            totalprice: 250000, 
            downpayment: 10000, 
            daixpersecond: 25, 
            buyer: "0x866be234ec760Ce372fBfE8B6b2C9Bb5A6F21Db4",
            seller: "0x688287dB2aCD138789B1cAc6D7bb00884e69038D",
            pending: 0,
        },
        {
            id: 2,
            endDate: 1780,
            listprice: 500000, 
            totalprice: 500000, 
            downpayment: 500000, 
            daixpersecond: 25, 
            buyer: "0x866be234ec760Ce372fBfE8B6b2C9Bb5A6F21Db4",
            seller: "0x688287dB2aCD138789B1cAc6D7bb00884e69038D",
            pending: 0,
        }
    ]

    if (data.length != 0) {
      return (
        <Card>
          <MaterialTable  
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              
                fontSize: "calc(6px + 0.8vmin)",
                color: '#141414'
               }}
  
              title={""}
              data={data}
              
  
              detailPanel={[
                { 
                  render: data => {
                    return (
                        <div style={{padding: '12px'}}>
                            MORE INFO HERE
                        </div>
                        )
                      },
                    }
                ]}
              
              columns={[
                { title: "ID", field: "id" },
                { title: "END DATE", field: "endDate"},
                { title: "LIST PRICE", field: "listprice" },
                { title: "TOT. PRICE", field: "totalprice"},
                { title: "DOWNPAYMENT", field: "downpayment"},
                { title: "DAIX/SEC", field: "daixpersecond"},
                { title: "BUYER", field: "buyer"},
                { title: "SELLER", field: "seller"},
                { title: "PENDING", field: "pending"},    
              ]}
             
              
              
              options={
                {
                  headerStyle: {
                    fontSize: "calc(7px + 0.8vmin)",
                    backgroundColor: '#070E14',
                    color: '#fafafa',
                    borderWidth: '3px',
                    borderColor: '#F37222'
                  }, 
                
                }
              }
            />
        </Card>
      )
    } else {

      return (
        <StyledDiv>
          <CenterWrapper>
            <Loader
                type="rings"
                color="#fafa"
                height={60}
                width={60}
              />
          </CenterWrapper>
        </StyledDiv>
      )
    }
}

export default Table; 