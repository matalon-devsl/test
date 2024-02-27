import React from "react";
import { Field, Form, Formik } from "formik";
import Joi from "joi";
import * as Yup from "yup";

import NameIcon from "@mui/icons-material/AssignmentInd";
import InfoIcon from "@mui/icons-material/Info";
import UsernameIcon from "@mui/icons-material/Person";
import OrgaIcon from "@mui/icons-material/StoreMallDirectory";
import { Typography } from "@mui/material";

import { joiFormikAdapter } from "../../helpers/joiFormikAdaptor";
import strings from "../../localizeStrings";
import FormTextField from "../Common/FormTextField";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import UserPassword from "../Common/UserPassword";

const styles = {
  textInputContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: "30px"
  },
  textInput: {
    width: "50%"
  },
  container: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "20px",
    marginLeft: "10px"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: "10px"
  },
  info: {
    display: "flex",
    paddingRight: 20
  },
  customWidth: {},
  createButtonContainer: {},
  createButton: {}
};

const UserDialogContent = ({
  organization,
  setDisplayName,
  setPassword,
  setConfirmPassword,
  setUsername,
  setOrganization,
  setIsUserFormValid
}) => {
  const usernameRegex = /^([A-Za-zÀ-ÿ0-9-_]*)$/;
  const passwordRegex = /^(?=.*[A-Za-zÀ-ÿ].*)(?=.*[0-9].*)([A-Za-zÀ-ÿ0-9-_!?@#$&*,.:/()[\] ])*$/;

  const initialValues = {
    accountname: "",
    username: "",
    password: "",
    confirmPassword: ""
  };

  const userSchemaJoi = Joi.object({
    accountname: Joi.string().required(),
    username: Joi.string().required().regex(usernameRegex).message(strings.users.username_invalid),
    password: Joi.string()
      .required()
      .regex(passwordRegex)
      .message(
        `${strings.users.password_conditions_preface} ${strings.users.password_conditions_letter}; ${strings.users.password_conditions_number}`
      ),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required()
  });

  const userSchema = Yup.object().shape({
    accountname: Yup.string().required(`${strings.users.account_name_error}`),
    username: Yup.string()
      .required(`${strings.users.login_id_errror}`)
      .matches(usernameRegex, strings.users.username_invalid)
      .notOneOf(["root"], strings.users.username_invalid),
    password: Yup.string()
      .required(`${strings.users.password_error}`)
      .min(8, `${strings.users.password_conditions_preface} ${strings.users.password_conditions_length}`)
      .matches(
        passwordRegex,
        `${strings.users.password_conditions_preface} ${strings.users.password_conditions_letter}; ${strings.users.password_conditions_number}`
      ),
    confirmPassword: Yup.string()
      .required(`${strings.users.confirm_password_error}`)
      .oneOf([Yup.ref("password"), null], strings.users.no_password_match)
  });

  const handleIsFormValid = (errors, isValid) => {
    if (!errors.password && !errors.confirmPassword && !errors.username && !errors.accountname) {
      setIsUserFormValid(isValid);
    } else {
      setIsUserFormValid(isValid);
    }
  };

  return (
    <div style={styles.container}>
      <span style={styles.info}>
        <InfoIcon style={styles.infoIcon} />
        <Typography variant="body2">{strings.users.privacy_notice}</Typography>
      </span>
      <div style={styles.textInputContainer}>
        <Formik initialValues={initialValues} validationSchema={joiFormikAdapter(userSchemaJoi)}>
          {({ values, errors, touched, isValid }) => (
            <Form>
              <TextInputWithIcon
                style={styles.textInput}
                label={strings.common.organization}
                value={organization}
                data-test="organization"
                disabled={true}
                error={false}
                icon={<OrgaIcon />}
                onKeyUp={(e) => setOrganization(e.targe.value)}
              />
              <Field
                name="accountname"
                style={styles.textInput}
                label={strings.users.account_name}
                value={values.accountname}
                icon={<NameIcon />}
                error={Boolean(errors.accountname && touched.accountname)}
                data-test="accountname"
                onKeyUp={(e) => {
                  setDisplayName(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={FormTextField}
                required
              />
              <Field
                name="username"
                label={strings.common.username}
                value={values.username}
                icon={<UsernameIcon />}
                error={Boolean(errors.username && touched.username)}
                data-test="username"
                id="username"
                onKeyUp={(e) => {
                  setUsername(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={FormTextField}
                required
              />
              <Field
                name="password"
                iconDisplayed={true}
                label={strings.common.password}
                password={values.password}
                error={Boolean(errors.password && touched.password)}
                data-test="password-new-user"
                onKeyUp={(e) => {
                  setPassword(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={UserPassword}
                required
              />
              <Field
                name="confirmPassword"
                iconDisplayed={true}
                label={strings.users.new_user_password_confirmation}
                password={values.confirmPassword}
                error={Boolean(errors.confirmPassword && touched.confirmPassword)}
                data-test="password-new-user-confirm"
                onKeyUp={(e) => {
                  setConfirmPassword(e.target.value);
                  handleIsFormValid(errors, isValid);
                }}
                as={UserPassword}
                required
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};
export default UserDialogContent;
