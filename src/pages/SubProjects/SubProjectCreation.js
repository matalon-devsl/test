import React from 'react';
import _ from 'lodash';

import CreationDialog from '../Common/CreationDialog';
import strings from '../../localizeStrings'
import SubProjectCreationContent from './SubProjectCreationContent';

const handleSubmit = (props) => {
  const { createSubProject, onDialogCancel, showSnackBar, storeSnackBarMessage,
    subProjectName, subProjectAmount, subProjectComment, subProjectCurrency, location } = props;
  createSubProject(subProjectName, subProjectAmount, subProjectComment, subProjectCurrency, location.pathname.split('/')[2]);
  onDialogCancel();
  storeSnackBarMessage('Added ' + subProjectName)
  showSnackBar();
}



const SubProjectCreation = (props) => {

  const steps = [
    {
      title: strings.project.project_details,
      content: < SubProjectCreationContent {...props} />,
      nextDisabled: (_.isEmpty(props.subProjectName) || _.isEmpty(props.subProjectComment) || !_.isNumber(props.subProjectAmount))
    }
  ]
  return (
    <CreationDialog
      title={strings.project.subproject_add}
      creationDialogShown={props.subprojectsDialogVisible}
      onDialogCancel={props.onSubprojectDialogCancel}
      handleSubmit={handleSubmit}
      steps={steps}
      numberOfSteps={steps.length}
      {...props} />
  )
}

export default SubProjectCreation;
