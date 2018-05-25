import React, { Component } from "react";
import { connect } from "react-redux";

import {
  fetchAllProjects,
  createProject,
  storeProjectName,
  storeProjectAmount,
  storeProjectComment,
  storeProjectCurrency,
  setCurrentStep,
  addApproverRole,
  addBankRole,
  removeApproverRole,
  removeAssignmentRole,
  removeBankRole,
  storeProjectThumbnail,
  showProjectDialog,
  onProjectDialogCancel
} from "./actions";

import Overview from "./Overview";
import { showSnackBar, storeSnackBarMessage } from "../Notifications/actions";
import globalStyles from "../../styles";
import { toJS } from "../../helper";

class OverviewContainer extends Component {
  componentWillMount() {
    this.props.fetchAllProjects(true);
  }

  render() {
    return (
      <div id="overviewpage">
        <div style={globalStyles.innerContainer}>
          <Overview {...this.props} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createProject: (name, amount, comment, currency, _, approver, assignee, bank, thumbnail) =>
      dispatch(createProject(name, amount, comment, currency, approver, assignee, bank, thumbnail)),
    showProjectDialog: () => dispatch(showProjectDialog()),
    onProjectDialogCancel: () => dispatch(onProjectDialogCancel()),
    storeProjectName: name => dispatch(storeProjectName(name)),
    storeProjectAmount: amount => dispatch(storeProjectAmount(amount)),
    storeProjectComment: comment => dispatch(storeProjectComment(comment)),
    storeProjectCurrency: currency => dispatch(storeProjectCurrency(currency)),
    addApproverRole: role => dispatch(addApproverRole(role)),
    addBankRole: role => dispatch(addBankRole(role)),
    removeApproverRole: role => dispatch(removeApproverRole(role)),
    removeAssignmentRole: role => dispatch(removeAssignmentRole(role)),
    removeBankRole: role => dispatch(removeBankRole(role)),
    showSnackBar: () => dispatch(showSnackBar(true)),
    storeSnackBarMessage: message => dispatch(storeSnackBarMessage(message)),
    setCurrentStep: step => dispatch(setCurrentStep(step)),
    storeProjectThumbnail: thumbnail => dispatch(storeProjectThumbnail(thumbnail)),
    fetchAllProjects: showLoading => dispatch(fetchAllProjects(showLoading))
  };
};

const mapStateToProps = state => {
  return {
    projects: state.getIn(["overview", "projects"]),
    allowedIntents: state.getIn(["login", "allowedIntents"]),
    dialogShown: state.getIn(["overview", "dialogShown"]),
    currentStep: state.getIn(["overview", "currentStep"]),
    displayName: state.getIn(["overview", "displayName"]),
    amount: state.getIn(["overview", "amount"]),
    description: state.getIn(["overview", "description"]),
    thumbnail: state.getIn(["overview", "thumbnail"]),
    currency: state.getIn(["overview", "currency"]),
    projectApprover: state.getIn(["overview", "projectApprover"]),
    projectBank: state.getIn(["overview", "projectBank"]),
    loggedInUser: state.getIn(["login", "loggedInUser"]),
    roles: state.getIn(["login", "roles"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(OverviewContainer));
