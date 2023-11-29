import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  title: {
    marginTop: 5,
    fontSize: 14,
    textAlign: "center",
    textDecoration: "underline",
    fontWeight: 500,
    fontFamily: "Times-Roman",
  },
  parentName: {
    fontSize: 10,
  },
  subtitle: {
    fontSize: 10,
  },
  text: {
    fontSize: 11,
    textAlign: "justify",
  },
  Timage: {
    marginVertical: 0,
    marginHorizontal: 0,
  },
  Bimage: {
    marginVertical: 0,
    marginHorizontal: 0,
    height: "140px",
  },
  fullPage: {
    paddingLeft: 20,
    paddingRight: 20,
  },
  page: {
    // fontFamily: "Times-Roman",
  },
  table: {
    display: "flex",
    width: "100%",
    borderLeft: "1px solid #000",
    borderBottom: "1px solid #000",
    marginTop: 10,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
    padding: 5,
    flex: 1,
    textAlign: "left",
    borderRight: "1px solid #000",
    margin: 0,
  },
  evenRow: {
    backgroundColor: "#fff",
  },
  oddRow: {
    backgroundColor: "#fff",
  },
  tableCell: {
    flex: 1,
    width: "50px",
    fontSize: 10,
    margin: 0,
    padding: 5,
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRight: "1px solid #000",
    borderTop: "1px solid #000",
  },
});
export default styles;
