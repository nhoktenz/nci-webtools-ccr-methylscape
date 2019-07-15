import React from "react";
import { Route, Link } from "react-router-dom";
import { Tabs, PageHeader, Menu } from "antd";
// import Summary from "./components/Summary";
import Experiments from "./components/Experiments";
import Samples from "./components/Samples";
import Projects from "./components/Projects";

import { connect } from "react-redux";

const TabPane = Tabs.TabPane;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "project",
      data: [],
      filter: {
        project: "",
        experiment: "",
      }
    };
  }

  // changeExperimentFilter =

  changeTab = (activeTab, filter={}) => {
    this.setState({filter})
    // console.log(activeTab);
    // console.log("2------------", filter)
    // console.log("3------------", this.state.filter)
    // if(Object.keys(filter).length != 0){
    //   this.setState({filter})
    // }
    this.setState({activeTab});
  };

  async componentDidMount() {
   const prefix = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : ""
   console.log(prefix)
    fetch(prefix + "/api/methylScapeTableData", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(data => {
        this.setState({ data });
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      <div>
        {/* <PageHeader /> */}
        <Tabs activeKey={this.state.activeTab} onChange={this.changeTab} defaultActiveKey="project">
          <TabPane tab="Project" key="project">
            <Projects data={this.state.data} changeTab={this.changeTab} />
          </TabPane>
          <TabPane tab="Experiments" key="experiments">
            <Experiments data={this.state.data}  changeTab={this.changeTab} />
          </TabPane>
          <TabPane tab="Samples" key="samples">
            <Samples data={this.state.data} />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default connect()(Home);
