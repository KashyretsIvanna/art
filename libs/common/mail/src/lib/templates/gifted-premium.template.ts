function formatDate(date: Date) {
  // Get day, month, and year
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();

  // Concatenate them in the desired format
  const formattedDate = `${day}.${month}.${year}`;

  return formattedDate;
}

export function giftedPremiumTemplate(
  name: string,
  subscriptionExpirationDate: Date
) {
  return `<html xmlns="http://www.w3.org/1999/xhtml" lang="en" xml:lang="en" style="background: #fff !important;">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width" />
    <style>
      @font-face {
      font-family: "Roboto";
      font-style: normal;
      font-weight: normal;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2) format("woff2");
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122,
      U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @font-face {
      font-family: "Roboto";
      font-style: normal;
      font-weight: bold;
      font-display: swap;
      src: url(https://fonts.gstatic.com/s/roboto/v27/KFOlCnqEu92Fr1MmWUlfBBc4AMP6lQ.woff2) format("woff2");
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122,
      U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
      }
      @import url("https://fonts.googleapis.com/css2?family=Benne&display=swap");
    </style>
    <style>
      @media only screen {
      html {
      min-height: 100%;
      background: #f3f3f3;
      }
      }
      @media only screen and (max-width: 620px) {
      table.body img {
      width: auto;
      height: auto;
      }
      table.body center {
      min-width: 0 !important;
      }
      table.body .container {
      width: 95% !important;
      }
      table.body .columns {
      height: auto !important;
      -moz-box-sizing: border-box;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      padding-left: 0 !important;
      padding-right: 0 !important;
      }
      table.body .columns .columns {
      padding-left: 0 !important;
      padding-right: 0 !important;
      }
      th.small-1 {
      display: inline-block !important;
      width: 8.33333% !important;
      }
      th.small-10 {
      }
      th.small-12 {
      display: inline-block !important;
      width: 100% !important;
      }
      table.menu {
      width: 100% !important;
      }
      table.menu td,
      table.menu th {
      width: auto !important;
      display: inline-block !important;
      }
      table.menu.vertical td,
      table.menu.vertical th {
      display: block !important;
      }
      table.menu[align="center"] {
      width: auto !important;
      }
      }
      @media screen and (max-width: 400px) {
      h3 {
      font-size: 16px !important;
      }
      a,
      
      table .verify-btn a {
      padding: 15px 20px 15px 20px !important;
      }

      a
      {padding: 0px !important;
        margin-right: 5px !important;
        line-height: 23px !important;
      }

      
      }
      @media only screen and (max-width: 500px) {

      td.bottom-logo{
        width: 20% !important;
        padding-top: 5px;
        

      }
      p{
        font-size: 17px !important;
      }

      @media only screen and (max-width: 354px) {
        a
      {
        margin-right: 1px !important;
      }


      }

      @media only screen and (max-width: 327px) {
        a
      {
        font-size: 7px !important;
        margin-right: 5px !important;

      }

      @media only screen and (max-width: 283px) {
        a
      {
        margin-right: 1px !important;

      }
      }

    
    
    }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Oxygen:wght@300;400;700&family=Roboto+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
  </head>
  <body
    style="
    -moz-box-sizing: border-box;
    -ms-text-size-adjust: 100%;
    -webkit-box-sizing: border-box;
    -webkit-text-size-adjust: 100%;
    margin: 0;
    background: #fff !important;
  
    box-sizing: border-box;
    color: #0a0a0a;
    font-family: Helvetica, Arial, Courier, sans-serif;
    font-size: 16px;
    font-weight: 400;
    line-height: 1.2;
    margin: 0;
    min-width: 100%;
    padding: 0;
    padding-bottom: 0;
    padding-left: 0;
    padding-right: 0;
    padding-top: 40px;
    text-align: left;
    width: 100% !important;
    "
    >
    <span
      class="preheader"
      style="
      color: #f3f3f3;
      display: none !important;
      font-size: 1px;
      line-height: 1px;
      max-height: 0;
      max-width: 0;
      mso-hide: all !important;
      opacity: 0;
      overflow: hidden;
      visibility: hidden;
      "
      ></span>
    <table
      class="body"
      style="
      margin: 0;
      background: #fff !important;
      background: #fff !important;
    background: url(https://i.imgur.com/dbno72M.png);
                                      background-repeat: no-repeat;
                                      background-size: cover;
      border-collapse: collapse;
      border-spacing: 0;
      color: #0a0a0a;
      font-family: Helvetica, Arial, Courier, sans-serif;
      font-size: 16px;
      font-weight: 400;
      height: 100%;
      line-height: 1.2;
      margin: 0;
      padding-bottom: 0;
      padding-left: 0;
      padding-right: 0;
      padding-top: 0;
      text-align: left;
      vertical-align: top;
      width: 100%;
      "
      >
      <tr style="padding-bottom: 0; padding-left: 0; padding-right: 0; padding-top: 0; text-align: left; vertical-align: top">
        <td
          class="center"
          align="center"
          valign="top"
          style="
          -moz-hyphens: auto;
          -webkit-hyphens: auto;
          margin: 0;
          border-collapse: collapse !important;
          color: #0a0a0a;
          font-family: Helvetica, Arial, Courier, sans-serif;
          font-size: 16px;
          font-weight: 400;
          hyphens: auto;
          line-height: 1.2;
          margin: 0;
          padding-bottom: 0;
          padding-left: 0;
          padding-right: 0;
          padding-top: 0;
          text-align: left;
          vertical-align: top;
          word-wrap: break-word;
          "
          >
          <center style="min-width: 600px; width: 100%">
            <table
              align="center"
              class="container main-wrapper float-center"
              style="
              background: url('<%=bg_main %>');
              /* background-color: #141e2c; */
              border: 1px solid #ebebeb;
              border-collapse: collapse;
              border-spacing: 0;
              float: none;
              margin: 0 auto;
              padding-bottom: 0;
              padding-left: 0;
              padding-right: 0;
              padding-top: 0;
              text-align: center;
              vertical-align: top;
              width: 600px;
              background: #fff !important;
    background: url(https://i.imgur.com/dbno72M.png);
                                      background-repeat: no-repeat;
                                      background-size: cover;
              "
              >
              <tbody >
                <tr
                  style="
                  padding-bottom: 0;
                  padding-left: 0;
                  padding-right: 0;
                  padding-top: 0;
                  text-align: left;
                  vertical-align: top;
                  background: #fff !important;
    background: url(https://i.imgur.com/dbno72M.png);
                                      background-repeat: no-repeat;
                                      background-size: cover;
                  "
                  >
                  <td
                    style="
                    -moz-hyphens: auto;
                    -webkit-hyphens: auto;
                    margin: 0;
                    border-collapse: collapse !important;
                    color: #0a0a0a;
                    font-family: Helvetica, Arial, Courier, sans-serif;
                    font-size: 16px;
                    font-weight: 400;
                    hyphens: auto;
                    line-height: 1.2;
                    margin: 0;
                    padding-bottom: 0;
                    padding-left: 0;
                    padding-right: 0;
                    padding-top: 0;
                    text-align: left;
                    vertical-align: top;
                    word-wrap: break-word;
                    "
                    >
                    <table
                      class="spacer"
                      style="
                      border-collapse: collapse;
                      border-spacing: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      text-align: left;
                      vertical-align: top;
                      width: 100%;
                      "
                      >
                      <tbody>
                        <tr
                          style="
                          padding-bottom: 0;
                          padding-left: 0;
                          padding-right: 0;
                          padding-top: 0;
                          text-align: left;
                          vertical-align: top;
                          "
                          >
                        </tr>
                      </tbody>
                    </table>
                    <table
                      class="row"
                      style="
                      border-collapse: collapse;
                      border-spacing: 0;
                      display: table;
                      padding: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      position: relative;
                      text-align: left;
                      vertical-align: top;
                      width: 100%;
                      "
                      >
                      <tbody>
                        <tr
                          style="
                          padding-bottom: 0;
                          padding-left: 0;
                          padding-right: 0;
                          padding-top: 0;
                          text-align: left;
                          vertical-align: top;
                          "
                          >
                          <th
                            class="small-12 large-10 columns"
                            style="
                            -moz-hyphens: auto;
                            -webkit-hyphens: auto;
                            margin: 0 auto;
                            border-collapse: collapse !important;
                            color: #0a0a0a;
                            font-family: Helvetica, Arial, Courier, sans-serif;
                            font-size: 16px;
                            font-weight: 400;
                            hyphens: auto;
                            line-height: 1.2;
                            margin: 0 auto;
                            padding-bottom: 0;
                            padding-left: 0px;
                            padding-right: 0px;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                            width: 480px;
                            word-wrap: break-word;
                            "
                            >
                            <table
                              style="
                              border-collapse: collapse;
                              border-spacing: 0;
                              padding-bottom: 0;
                              padding-left: 0;
                              padding-right: 0;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 100%;
                              "
                              >
                              <tbody>
                                <tr
                                  style="
                                  padding-bottom: 0;
                                  padding-left: 0;
                                  padding-right: 0;
                                  padding-top: 0;
                                  text-align: left;
                                  vertical-align: top;
                                  "
                                  >
                                  <th
                                    style="
                                    -moz-hyphens: auto;
                                    -webkit-hyphens: auto;
                                    margin: 0;
                                    border-collapse: collapse !important;
                                    color: #0a0a0a;
                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                    font-size: 16px;
                                    font-weight: 400;
                                    hyphens: auto;
                                    line-height: 1.2;
                                    margin: 0;
                                    padding-bottom: 0;
                                    padding-left: 0;
                                    padding-right: 0;
                                    padding-top: 0;
                                    text-align: left;
                                    vertical-align: top;
                                    word-wrap: break-word;
                                    "
                                    >
                                    <img
                                      src="https://i.imgur.com/wOkBcZB.png"
                                      width="100%"
                                      alt="Logo"
                                      style="
                                      -ms-interpolation-mode: bicubic;
                                      clear: both;
                                      display: block;
                                      max-width: 100%;
                                      outline: 0;
                                      text-decoration: none;
                                      margin-left: auto;
                                      margin-right: auto;
                                      "
                                      />
                                  </th>
                                </tr>
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                    <br />
                    <br />
                    <table
                      class="row"
                      style="
                      border-collapse: collapse;
                      border-spacing: 0;
                      display: table;
                      padding: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      position: relative;
                      text-align: left;
                      vertical-align: top;
                      width: 100%;
                      "
                      >
                      <tbody>
                        <tr
                          style="
                          padding-bottom: 0;
                          padding-left: 0;
                          padding-right: 0;
                          padding-top: 0;
                          text-align: left;
                          vertical-align: top;
                          "
                          >
                          <th
                            class="small-12 large-10 columns"
                            style="
                            -moz-hyphens: auto;
                            -webkit-hyphens: auto;
                            margin: 0 auto;
                            border-collapse: collapse !important;
                            color: #0a0a0a;
                            font-family: Helvetica, Arial, Courier, sans-serif;
                            font-size: 16px;
                            font-weight: 400;
                            hyphens: auto;
                            line-height: 1.2;
                            margin: 0 auto;
                            padding-bottom: 0;
                            padding-left: 0px;
                            padding-right: 0px;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                            width: 480px;
                            word-wrap: break-word;
                            "
                            >
                            <table
                              style="
                              border-collapse: collapse;
                              border-spacing: 0;
                              padding-bottom: 0;
                              padding-left: 0;
                              padding-right: 0;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 100%;
                              "
                              >
                              <tbody>
                                <tr
                                style="
                                padding-bottom: 0;
                                padding-left: 0;
                                padding-right: 0;
                                padding-top: 0;
                                text-align: left;
                                vertical-align: top;
                                "
                                >
                                <th
                                  style="
                                  -moz-hyphens: auto;
                                  -webkit-hyphens: auto;
                                  margin: 0;
                                  border-collapse: collapse !important;
                                  color: #0a0a0a;
                                  font-family: Helvetica, Arial, Courier, sans-serif;
                                  font-size: 16px;
                                  font-weight: 400;
                                  hyphens: auto;
                                  line-height: 1.2;
                                  margin: 0;
                                  padding-bottom: 0;
                                  padding-left: 0;
                                  padding-right: 0;
                                  padding-top: 0;
                                  text-align: left;
                                  vertical-align: top;
                                  word-wrap: break-word;
                                  "
                                  >
                                  <p  width="100%"
                                  alt="Logo"
                                  style="
                                  -ms-interpolation-mode: bicubic;
                                  clear: both;
                                  display: block;
                                  max-width: 100%;
                                  outline: 0;
                                  text-decoration: none;
                                  width: auto;
                                  margin-left: auto;
                                  margin-right: auto;
                                  color: #63ACC2;
                                  text-align: center;
                                  font-family: Roboto Condensed;
                                  font-size: 22px;
                                  font-style: normal;
                                  font-weight: 700;
                                  line-height: 40px; /* 181.818% */
                                  text-transform: uppercase;
                                  margin-bottom: 15px;
                                  "
                                  >${name}</p>
                                  
                                </th>
                                <br/>
                                <br/>
                              </tr>
                             
                                <tr
                                  style="
                                  padding-bottom: 0;
                                  padding-left: 0;
                                  padding-right: 0;
                                  padding-top: 0;
                                  text-align: left;
                                  vertical-align: top;
                                  "
                                  >
                                  <th
                                    style="
                                    -moz-hyphens: auto;
                                    -webkit-hyphens: auto;
                                    margin: 0;
                                    border-collapse: collapse !important;
                                    color: #0a0a0a;
                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                    font-size: 16px;
                                    font-weight: 400;
                                    hyphens: auto;
                                    line-height: 1.2;
                                    margin: 0;
                                    padding-bottom: 0;
                                    padding-left: 24px;
                                    padding-right:24px ;
                                    padding-top: 0;
                                    text-align: left;
                                    vertical-align: top;
                                    word-wrap: break-word;
                                    "
                                    >
                                    <img
                                    src="https://i.imgur.com/zWbKKQv.png"
                                    width="100%"
                                    alt="Logo"
                                    style="
                                    -ms-interpolation-mode: bicubic;
                                    clear: both;
                                    display: block;
                                    max-width: 100%;
                                    outline: 0;
                                    text-decoration: none;
                                    width: auto;
                                    margin-left: auto;
                                    margin-right: auto;
                                    max-width: 100%;
                                    "
                                  />  
                                    
                                  </th>
                                </tr>

                                <tr
                                  style="
                                  padding-bottom: 0;
                                  padding-left: 0;
                                  padding-right: 0;
                                  padding-top: 0;
                                  text-align: left;
                                  vertical-align: top;
                                  "
                                  >
                                  <th
                                    style="
                                    -moz-hyphens: auto;
                                    -webkit-hyphens: auto;
                                    margin: 0;
                                    border-collapse: collapse !important;
                                    color: #0a0a0a;
                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                    font-size: 16px;
                                    font-weight: 400;
                                    hyphens: auto;
                                    line-height: 1.2;
                                    margin: 0;
                                    padding-bottom: 0;
                                    padding-left: 24px;
                                    padding-right:24px ;
                                    padding-top: 20px;
                                    text-align: left;
                                    vertical-align: top;
                                    word-wrap: break-word;
                                    "
                                    >
                                    <p style="color: #283754;
text-align: center;
font-family: Roboto Condensed;
font-size: 22px;
font-style: normal;
font-weight: 400;
line-height: normal;">You can use all premium features now!</p> 
                                    
                                  </th>
                                </tr>

                            
                                
                              

                            
                                
                              
                             
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                    <br/>
                    <br/>
                    <table
                      class="row"
                      style="
                      border-collapse: collapse;
                      border-spacing: 0;
                      display: table;
                      padding: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      position: relative;
                      text-align: left;
                      vertical-align: top;
                      width: 100%;
                      "
                      >
                      <tbody>
                        <tr
                          style="
                          padding-bottom: 0;
                          padding-left: 0;
                          padding-right: 0;
                          padding-top: 0;
                          text-align: left;
                          vertical-align: top;
                          "
                          >
                          <th
                            class="main-body small-12 large-10 columns"
                            style="
                            -moz-hyphens: auto;
                            -webkit-hyphens: auto;
                            margin: 0 auto;
                            border: none;
                            border-collapse: collapse !important;
                            color: #0a0a0a;
                            font-family: Helvetica, Arial, Courier, sans-serif;
                            font-size: 16px;
                            font-weight: 400;
                            hyphens: auto;
                            line-height: 1.2;
                            margin: 0 auto;
                            padding-bottom: 0;
                            padding-left: 0px;
                            padding-right: 0px;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                            width: 480px;
                            word-wrap: break-word;
                            "
                            >
                            <table
                              style="
                              border-collapse: collapse;
                              border-spacing: 0;
                              padding-bottom: 0;
                              padding-left: 0;
                              padding-right: 0;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 100%;
                              "
                              >
                              <tbody>
                                <tr
                                  style="
                                  padding-bottom: 0;
                                  padding-left: 0;
                                  padding-right: 0;
                                  padding-top: 0;
                                  text-align: left;
                                  vertical-align: top;
                                  "
                                  >
                                  <th
                                    style="
                                    -moz-hyphens: auto;
                                    -webkit-hyphens: auto;
                                    margin: 0;
                                    border-collapse: collapse !important;
                                    color: #0a0a0a;
                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                    font-size: 16px;
                                    font-weight: 400;
                                    hyphens: auto;
                                    line-height: 1.2;
                                    margin: 0;
                                    padding-bottom: 0;
                                    padding-left: 0;
                                    padding-right: 0;
                                    padding-top: 0;
                                    text-align: left;
                                    vertical-align: top;
                                    word-wrap: break-word;
                                    "
                                    >
                                    <table
                                      class="spacer"
                                      style="
                                      border-collapse: collapse;
                                      border-spacing: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      text-align: left;
                                      vertical-align: top;
                                      width: 100%;
                                      "
                                      >
                                      <tbody>
                                        <tr
                                          style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                          "
                                          >
                                          <td
                                            height="16"
                                            style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial, Courier, sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 16px;
                                            margin: 0;
                                            mso-line-height-rule: exactly;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                            "
                                            >
                                            &nbsp;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <br />
                                    <table
                                      class="row"
                                      style="
                                      border-collapse: collapse;
                                      border-spacing: 0;
                                      display: table;
                                      padding: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      position: relative;
                                      text-align: left;
                                      vertical-align: top;
                                      width: 100%;
                                      "
                                      >
                                      <tbody>
                                        <tr
                                          style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                          "
                                          >
                                          <th
                                            class="small-10 large-10 columns"
                                            style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0 auto;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial, Courier, sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 1.2;
                                            margin: 0 auto;
                                            padding-bottom: 0;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            width: 83.33333%;
                                            word-wrap: break-word;
                                            "
                                            >
                                            
                                            <table
                                              style="
                                              border-collapse: collapse;
                                              border-spacing: 0;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              width: 100%;
                                              "
                                              >
                                              <tbody>
                                                <tr
                                                  style="
                                                  padding-bottom: 0;
                                                  padding-left: 0;
                                                  padding-right: 0;
                                                  padding-top: 0;
                                                  text-align: left;
                                                  vertical-align: top;
                                                  "
                                                  >
                                                  <th
                                                    style="
                                                    -moz-hyphens: auto;
                                                    -webkit-hyphens: auto;
                                                    margin: 0;
                                                    border-collapse: collapse !important;
                                                    color: #0a0a0a;
                                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                                    font-size: 16px;
                                                    font-weight: 400;
                                                    hyphens: auto;
                                                    line-height: 1.2;
                                                    margin: 0;
                                                    padding-bottom: 0;
                                                    padding-left: 0;
                                                    padding-right: 0;
                                                    padding-top: 0;
                                                    text-align: left;
                                                    vertical-align: top;
                                                    word-wrap: break-word;
                                                    "
                                                    >
                                                    <img
                                                    src="https://i.imgur.com/kuLZQeh.png"
                                                    width="100%"
                                                    alt="Logo"
                                                    style="
                                                    -ms-interpolation-mode: bicubic;
                                                    clear: both;
                                                    display: block;
                                                    max-width: 100%;
                                                    outline: 0;
                                                    text-decoration: none;
                                                    width: auto;
                                                    margin-left: auto;
                                                    margin-right: auto;
                                                    "
                                                  />
                                                    
                                                   
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                            <table
                      class="row"
                      style="
                      border-collapse: collapse;
                      border-spacing: 0;
                      display: table;
                      padding: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      position: relative;
                      text-align: left;
                      vertical-align: top;
                      width: 100%;
                      "
                      >
                      <tbody>
                        <tr
                          style="
                          padding-bottom: 0;
                          padding-left: 0;
                          padding-right: 0;
                          padding-top: 0;
                          text-align: left;
                          vertical-align: top;
                          "
                          >
                          <th
                            class="small-12 large-10 columns"
                            style="
                            -moz-hyphens: auto;
                            -webkit-hyphens: auto;
                            margin: 0 auto;
                            border-collapse: collapse !important;
                            color: #0a0a0a;
                            font-family: Helvetica, Arial, Courier, sans-serif;
                            font-size: 16px;
                            font-weight: 400;
                            hyphens: auto;
                            line-height: 1.2;
                            margin: 0 auto;
                            padding-bottom: 0;
                            padding-left: 0px;
                            padding-right: 0px;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                            width: 480px;
                            word-wrap: break-word;
                            "
                            >
                            <table
                              style="
                              border-collapse: collapse;
                              border-spacing: 0;
                              padding-bottom: 0;
                              padding-left: 0;
                              padding-right: 0;
                              padding-top: 0;
                              text-align: left;
                              vertical-align: top;
                              width: 100%;
                              "
                              >
                              <tbody>
                                
                             
                                <tr
                                  style="
                                  padding-bottom: 0;
                                  padding-left: 0;
                                  padding-right: 0;
                                  padding-top: 0;
                                  text-align: left;
                                  vertical-align: top;
                                  "
                                  >
                                  <th
                                    style="
                                    -moz-hyphens: auto;
                                    -webkit-hyphens: auto;
                                    margin: 0;
                                    border-collapse: collapse !important;
                                    color: #0a0a0a;
                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                    font-size: 16px;
                                    font-weight: 400;
                                    hyphens: auto;
                                    line-height: 1.2;
                                    margin: 0;
                                    padding-bottom: 0;
                                    padding-left: 24px;
                                    padding-right:24px ;
                                    padding-top: 20px;
                                    text-align: left;
                                    vertical-align: top;
                                    word-wrap: break-word;
                                    "
                                    >
                                    <p style="color: #283754;
text-align: center;
font-family: Roboto Condensed;
max-width: 400px;
font-size: 22px;
margin: 0 auto;
font-style: normal;
font-weight: 400;
line-height: normal;">Free premium subscription will be expired on ${formatDate(
    subscriptionExpirationDate
  )}</p> 
                                    
                                  </th>
                                </tr>

                            
                                
                              

                            
                                
                              
                             
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                                          </th>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <br/>
                                    <br/>
                                    <table
                                      class="spacer"
                                      style="
                                      border-collapse: collapse;
                                      border-spacing: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      text-align: left;
                                      vertical-align: top;
                                      width: 100%;
                                      "
                                      >
                                      <tbody>
                                        <tr
                                          style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                          "
                                          >
                                          <td
                                            height="14"
                                            style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial, Courier, sans-serif;
                                            font-size: 14px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 14px;
                                            margin: 0;
                                            padding-bottom: 0;
                                            padding-left: 0;
                                            padding-right: 0;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            word-wrap: break-word;
                                            "
                                            >
                                            &nbsp;
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <table
                                      class="row"
                                      style="
                                      border-collapse: collapse;
                                      border-spacing: 0;
                                      display: table;
                                      padding: 0;
                                      padding-bottom: 0;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 0;
                                      position: relative;
                                      text-align: left;
                                      vertical-align: top;
                                      width: 100%;
                                      "
                                      >
                                      <tbody>
                                        <tr
                                          style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                          "
                                          >
                                          <th
                                            class="small-1 large-1 columns first"
                                            style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0 auto;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial, Courier, sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 1.2;
                                            margin: 0 auto;
                                            padding-bottom: 0;
                                            padding-left: 0 !important;
                                            padding-right: 10px;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            width: 8.33333%;
                                            word-wrap: break-word;
                                            "
                                            >
                                            <table
                                              style="
                                              border-collapse: collapse;
                                              border-spacing: 0;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              width: 100%;
                                              "
                                              >
                                              <tbody>
                                                <tr
                                                  style="
                                                  padding-bottom: 0;
                                                  padding-left: 0;
                                                  padding-right: 0;
                                                  padding-top: 0;
                                                  text-align: left;
                                                  vertical-align: top;
                                                  "
                                                  >
                                                  <th
                                                    style="
                                                    -moz-hyphens: auto;
                                                    -webkit-hyphens: auto;
                                                    margin: 0;
                                                    border-collapse: collapse !important;
                                                    color: #0a0a0a;
                                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                                    font-size: 16px;
                                                    font-weight: 400;
                                                    hyphens: auto;
                                                    line-height: 1.2;
                                                    margin: 0;
                                                    padding-bottom: 0;
                                                    padding-left: 0;
                                                    padding-right: 0;
                                                    padding-top: 0;
                                                    text-align: left;
                                                    vertical-align: top;
                                                    word-wrap: break-word;
                                                    "
                                                    ></th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th
                                            class="small-10 large-10 columns"
                                            style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0 auto;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial, Courier, sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 1.2;
                                            margin: 0 auto;
                                            padding-bottom: 0;
                                            padding-left: 10px;
                                            padding-right: 10px;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            width: 83.33333%;
                                            word-wrap: break-word;
                                            "
                                            >
                                            <table
                                              style="
                                              border-collapse: collapse;
                                              border-spacing: 0;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              width: 100%;
                                              "
                                              >
                                              <tbody>
                                                <tr
                                                  style="
                                                  padding-bottom: 0;
                                                  padding-left: 0;
                                                  padding-right: 0;
                                                  padding-top: 0;
                                                  text-align: left;
                                                  vertical-align: top;
                                                  "
                                                  >
                                                  <th
                                                    style="
                                                    -moz-hyphens: auto;
                                                    -webkit-hyphens: auto;
                                                    margin: 0;
                                                    border-collapse: collapse !important;
                                                    color: #0a0a0a;
                                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                                    font-size: 16px;
                                                    font-weight: 400;
                                                    hyphens: auto;
                                                    line-height: 1.2;
                                                    margin: 0;
                                                    padding-bottom: 0;
                                                    padding-left: 0;
                                                    padding-right: 0;
                                                    padding-top: 0;
                                                    text-align: left;
                                                    vertical-align: top;
                                                    word-wrap: break-word;
                                                    "
                                                    >
                                                    <center style="min-width: none !important; width: 100%">
                                                      <table
                                                        class="button large radius verify-btn float-center"
                                                        style="
                                                        margin: 0 0 10px 0;
                                                        border-collapse: collapse;
                                                        border-spacing: 0;
                                                        float: none;
                                                        margin: 0 0 10px 0;
                                                        padding-bottom: 0;
                                                        padding-left: 0;
                                                        padding-right: 0;
                                                        padding-top: 0;
                                                        text-align: center;
                                                        vertical-align: top;
                                                        width: auto;
                                                        "
                                                        ></table>
                                                    </center>
                                                  </th>
                                                </tr>
                                              </tbody>
                                            </table>
                                          </th>
                                          <th
                                            class="small-1 large-1 columns last"
                                            style="
                                            -moz-hyphens: auto;
                                            -webkit-hyphens: auto;
                                            margin: 0 auto;
                                            border-collapse: collapse !important;
                                            color: #0a0a0a;
                                            font-family: Helvetica, Arial, Courier, sans-serif;
                                            font-size: 16px;
                                            font-weight: 400;
                                            hyphens: auto;
                                            line-height: 1.2;
                                            margin: 0 auto;
                                            padding-bottom: 0;
                                            padding-left: 10px;
                                            padding-right: 0 !important;
                                            padding-top: 0;
                                            text-align: left;
                                            vertical-align: top;
                                            width: 8.33333%;
                                            word-wrap: break-word;
                                            "
                                            >
                                            <table
                                              style="
                                              border-collapse: collapse;
                                              border-spacing: 0;
                                              padding-bottom: 0;
                                              padding-left: 0;
                                              padding-right: 0;
                                              padding-top: 0;
                                              text-align: left;
                                              vertical-align: top;
                                              width: 100%;
                                              "
                                              >
                                              <tbody>
                                                <tr
                                                  style="
                                                  padding-bottom: 0;
                                                  padding-left: 0;
                                                  padding-right: 0;
                                                  padding-top: 0;
                                                  text-align: left;
                                                  vertical-align: top;
                                                  "
                                                  >
                                                  <th
                                                    style="
                                                    -moz-hyphens: auto;
                                                    -webkit-hyphens: auto;
                                                    margin: 0;
                                                    border-collapse: collapse !important;
                                                    color: #0a0a0a;
                                                    font-family: Helvetica, Arial, Courier, sans-serif;
                                                    font-size: 16px;
                                                    font-weight: 400;
                                                    hyphens: auto;
                                                    line-height: 1.2;
                                                    margin: 0;
                                                    padding-bottom: 0;
                                                    padding-left: 0;
                                                    padding-right: 0;
                                                    padding-top: 0;
                                                    text-align: left;
                                                    vertical-align: top;
                                                    word-wrap: break-word;
                                                    "
                                                    ></th>
                                                </tr>
                                                
                                                
                                              </tbody>
                                            </table>
                                          </th>
                                        </tr>
                                        
                                      </tbody>
                                    </table>
                                   
                                    <table
                                      class="row"
                                      style="
                                      border-collapse: collapse;
                                      border-spacing: 0;
                                      display: table;
                                      padding: 0;
                                      padding-bottom: 10px;
                                      padding-left: 0;
                                      padding-right: 0;
                                      padding-top: 10px;
                                      position: relative;
                                      text-align: left;
                                      vertical-align: top;
                                      width: 100%;
                                     
                                      background: url(https://i.imgur.com/slshQql.png);
                                      background-repeat: no-repeat;
                                      background-size: cover;
                                      "
                                      >
                                      
                                      <tbody>
                                        <tr>
                                          <td style="height: 9px">

                                          </td>
                                        </tr>
                                        <tr
                                          style="
                                          padding-bottom: 0;
                                          padding-left: 0;
                                          padding-right: 0;
                                          padding-top: 0;
                                          text-align: left;
                                          vertical-align: top;
                                          "
                                          >
                                            <td style="width: 33.3%"></td>
                                            <td                                                   class="bottom-logo"
                                            class="bottom-logo"
                                            style="width: 33.3%;
                                            height: auto;
                                            ">
                                            <img
                                              src="https://i.imgur.com/9v83wiL.png"
                                              width="100%"
                                              alt="Logo"
                                              style="
                                              -ms-interpolation-mode: bicubic;
                                              clear: both;
                                              display: block;
                                              max-width: 100%;
                                              outline: 0;
                                              text-decoration: none;
                                              width: auto;
                                              margin-left: auto;
                                              margin-right: auto;
                                            "
                                            />
                                            </td>
                                            <td style="width: 33.3%; text-align: right; 
                        ">
                                              <a href="#" style="color: #5484A8;
                                              text-align: center;
                                              font-family: Roboto Condensed;
                                              font-size: 9px;
                                              font-style: normal;
                                              font-weight: 400;
                                              line-height: normal; 
                                                     line-height: 23px ;

                                              text-decoration-line: underline;
                                              text-transform: capitalize;">Help & Support</a>
                                              <a href="#" style="color: #5484A8;
                                              text-align: center;
                                              font-family: Roboto Condensed;
                                              font-size: 9px;
                                              line-height: 23px ;

                                              font-style: normal;
                                              font-weight: 400;
                                              line-height: normal;
                                              text-decoration-line: underline;
                                              margin-right: 24px;
                                              text-transform: capitalize;">Privacy Policy</a>
                                            </td>
                                          </tr>
                                          <tr>
                                            
                                          <br />
                                        </tr>
                                        <tr>
                                        <td style="height: 9px">

                                        </td>
                                      </tr>
                              </tbody>
                            </table>
                          </th>
                        </tr>
                      </tbody>
                    </table>
                    <table
                      class="spacer"
                      style="
                      border-collapse: collapse;
                      border-spacing: 0;
                      padding-bottom: 0;
                      padding-left: 0;
                      padding-right: 0;
                      padding-top: 0;
                      text-align: left;
                      vertical-align: top;
                      width: 100%;
                      "
                      >
                      <tbody>
                        <tr
                          style="
                          padding-bottom: 0;
                          padding-left: 0;
                          padding-right: 0;
                          padding-top: 0;
                          text-align: left;
                          vertical-align: top;
                          "
                          >
                          <td
                            height="0"
                            style="
                            -moz-hyphens: auto;
                            -webkit-hyphens: auto;
                            margin: 0;
                            border-collapse: collapse !important;
                            color: #0a0a0a;
                            font-family: Helvetica, Arial, Courier, sans-serif;
                            font-size: 0px;
                            font-weight: 400;
                            hyphens: auto;
                            line-height: 0px;
                            margin: 0;
                            mso-line-height-rule: exactly;
                            padding-bottom: 0;
                            padding-left: 0;
                            padding-right: 0;
                            padding-top: 0;
                            text-align: left;
                            vertical-align: top;
                            word-wrap: break-word;
                            "
                            >
                            &nbsp;
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </center>
        </td>
      </tr>
    </table>
    <div style="display: none; white-space: nowrap; font: 15px courier; line-height: 0">
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
      &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
    </div>
  </body>
</html>`;
}
