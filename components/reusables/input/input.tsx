// components/Input/Input.tsx
import { useState } from "react";
import styles from "./Input.module.scss";
import { IconType } from "react-icons";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import cx from 'classnames'

interface InputProps {
  type: "text" | "email" | "password" | "number";
  placeholder: string;
  icon: IconType;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  icon: Icon,
  value,
  onChange,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={styles.inputWrapper}>
      <div className={styles.inputInner}>
        <Icon className={styles.icon} />
        <input
          type={currentType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          className={styles.inputField}
        />
        <div 
        className={cx(styles.slash,isPassword && styles.active)}
        onClick={() => setShowPassword(!showPassword)}
        >
            {showPassword ? <FaEyeSlash className={styles.icon__} size={25}/> : <FaEye className={styles.icon__} size={25}/>}
        </div>
        {/* {isPassword && (
          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash className={styles.icon__}/> : <FaEye className={styles.icon__}/>}
          </button>
        )} */}
      </div>
    </div>
  );
};

export default Input;
