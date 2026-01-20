"use client";

import { signup } from "@/features/auth/services/auth.service";
import FormInput from "@/shared/components/ui/FormInput";
import { Button } from "@/shared/components/ui/Button";
import ButtonInput from "@/shared/components/ui/ButtonInput";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import clsx from "clsx";
import PostCode from "react-daum-postcode";
import Modal from "@/shared/components/ui/Modal";
import RegionSelector from "../../region/components/RegionSelector";
import ProductPriceTable from "@/features/product/components/ProductPriceTable";

type RegisterFormProps = {
  prevStep: () => void;
  nextStep: () => void;
};

const RegisterForm = ({ prevStep, nextStep }: RegisterFormProps) => {
  type AddressVariant = "business" | "actual" | null;

  const [showPostModal, setShowPostModal] = useState(false);
  const [isOpenSearchRegionModal, setIsOpenSearchRegionModal] = useState(false);
  const [isOpenDeliveryRegionModal, setIsOpenDeliveryRegionModal] =
    useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  /* 우편번호 모달 */
  const openPostModal = (
    e: React.MouseEvent<HTMLButtonElement>,
    _type: AddressVariant
  ) => {
    e.preventDefault();
    void _type;
    //setSelectedTarget(type);
    setShowPostModal(true);
  };

  const closePostModal = () => {
    setShowPostModal(false);
  };

  /* 우편번호 콜백 */
  interface PostCodeData {
    address?: string;
    addressType?: "R" | "J" | string;
    bname?: string;
    buildingName?: string;
    zonecode?: string;
    sido?: string;
    sigungu?: string;
    roadAddress?: string;
    jibunAddress?: string;
  }

  const handleComplete = async (data: PostCodeData) => {
    console.log(data, data);
    const {
      address,
      addressType,
      bname,
      buildingName,
      zonecode,
      sido,
      sigungu,
      roadAddress,
      jibunAddress,
    } = data;

    // 기본 주소는 선택 유형에 따라 도로명/지번을 사용
    const base = address || roadAddress || jibunAddress || "";
    let extraAddress = "";

    // 도로명 주소 선택 시만 추가 상세 구성 (법정동/건물명)
    if (addressType === "R") {
      if (bname) extraAddress += bname;
      if (buildingName)
        extraAddress += extraAddress ? `, ${buildingName}` : buildingName;
    }

    const fullAddress = extraAddress ? `${base} (${extraAddress})` : base;

    // 폼 값 설정 (지번 선택 시에도 항상 설정)
    setValue("businessProfile.officeAddress.base", fullAddress, {
      shouldValidate: true,
    });
    setValue("businessProfile.officeAddress.zipcode", zonecode);
    setValue("businessProfile.officeAddress.sido", sido);
    setValue("businessProfile.officeAddress.sigungu", sigungu);
    setValue("activityRegions.sido", sido);
    setValue("activityRegions.sigungu", sigungu);

    closePostModal();
  };

  /* 가입신청 클릭 핸들러 */
  interface HttpError {
    response?: { data?: { message?: string; details?: string } };
  }

  const onSubmit = async (formData: RegisterFormInputs) => {
    if (
      !formData.loginId ||
      !formData.password ||
      !formData.name ||
      !formData.mobile
    ) {
      alert("필수 정보를 입력해주세요.");
      return;
    }

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await signup(formData);

      // authService.signup이 이제 response.data를 반환하므로 직접 message에 접근
      const message =
        response.message ||
        "회원가입이 완료되었습니다. 관리자 승인 후 로그인이 가능합니다.";
      alert(message);
      nextStep();
    } catch (error: unknown) {
      console.error("회원가입 오류:", error);
      alert(
        (error as HttpError)?.response?.data?.message ||
          "회원가입 중 오류가 발생했습니다."
      );
    }
  };

  /* 본인인증 핸들러 */
  const handleCertificationClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  /* 활동지역 검색 핸들러 */
  const handleSearchRegion = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsOpenSearchRegionModal(true); //지역검색 모달 Open
  };

  /* 배송가능지역 핸들러 */
  const handleDeliveryRegionClick = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    setIsOpenDeliveryRegionModal(true); //배송지역설정 모달 Open
  };

  /* 활동지역 저장 핸들러 */
  const handleSearchRegionSave = () => {};

  /* 배송가능지역 저장 핸들러 */
  const handleDeliveryRegionSave = () => {
    console.log("배송지역 저장");
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
          회원 정보입력
        </h2>
        {/* <p className="text-sm text-gray-500">
          회원가입을 위한 정보를 입력해주세요
        </p> */}
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-xs text-primary font-medium">
            <span className="text-danger">*</span> 표시는 필수입력 사항입니다
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <div className="grid md:grid-cols-2 md:gap-6">
          {/* 아이디 */}
          <FormInput
            label="아이디"
            isRequired={true}
            placeholder="6~20자의 영문, 숫자 조합"
            // buttonOnClick={checkloginIdDuplicate}
            // buttonColor={"#ddd"}
            // buttonLabel="중복확인"
            error={errors.loginId?.message}
            {...register("loginId", {
              required: "비밀번호를 입력하세요.",
            })}
          ></FormInput>
          {/* 이름(상호명) */}
          <FormInput
            label="이름(상호)"
            isRequired={true}
            placeholder="이름을 입력하세요"
            error={errors.name?.message}
            {...register("name", { required: "이름을 입력하세요." })}
          ></FormInput>
        </div>

        <div className="grid md:grid-cols-2">
          <FormInput
            label="게시판 닉네임"
            isRequired={true}
            placeholder="최대 10글자의 영문, 숫자 조합"
            error={errors.nickname?.message}
            {...register("nickname", { required: "이름을 입력하세요." })}
          ></FormInput>
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          {/* 비밀번호 */}
          <FormInput
            label="비밀번호"
            isRequired={true}
            placeholder="8~16자의 영문, 숫자, 특수문자 조합"
            error={errors.password?.message}
            {...register("password", {
              required: "비밀번호를 입력하세요.",
            })}
            type="password"
          ></FormInput>

          {/* 비밀번호 확인 */}
          <FormInput
            label="비밀번호 확인"
            isRequired={true}
            placeholder="비밀번호를 다시 입력하세요."
            error={errors.passwordConfirm?.message}
            {...register("passwordConfirm", {
              required: "비밀번호를 입력하세요.",
            })}
            type="password"
          ></FormInput>
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          {/* 휴대 전화번호 */}
          <ButtonInput
            // readOnly
            // disabled
            label="휴대 전화번호"
            isRequired={true}
            placeholder="인증버튼을 클릭하세요."
            // buttonOnClick={checkloginIdDuplicate} //인증 함수로 바꿔야함.
            // buttonLabel={"인증"}
            error={errors.mobile?.message}
            {...register("mobile", {
              required: "휴대전화번호를 입력하세요.",
            })}
            type="tel"
            buttonLabel="인증"
            buttonOnClick={handleCertificationClick}
          ></ButtonInput>

          {/* 팩스번호 */}
          <FormInput
            label="팩스번호"
            placeholder="팩스번호를 입력하세요 (- 제외)"
            {...register("businessProfile.fax")}
          ></FormInput>
        </div>

        <div className="grid md:grid-col md:gap-4">
          {/* 활동지역 */}
          <ButtonInput
            // readOnly
            // disabled
            label="활동지역"
            isRequired={true}
            placeholder="지역검색 버튼을 클릭하세요."
            error={errors.activityRegions?.full?.message}
            {...register("activityRegions.full", {
              required: "활동지역을 입력해주세요.",
            })}
            buttonLabel="지역검색"
            buttonOnClick={handleSearchRegion}
          />
        </div>

        <div className="grid md:grid-cols-2">
          <div className="my-4 tracking-tight">
            <label className="text-sm mr-5 font-medium text-gray-700">
              배송 지역 설정<span className="sf-req">*</span>
            </label>

            <Button
              onClick={handleDeliveryRegionClick}
              variant="default"
              className="rounded-md py-3"
            >
              배송가능지역
            </Button>
          </div>
        </div>

        {/* 실제 주소 */}
        <div className="mt-2 mb-6">
          <label className="block font-medium mb-3 text-sm text-gray-700">
            화원실제주소<span className="sf-req">*</span>
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                readOnly
                required
                className={clsx(
                  "w-28 h-fit appearance-none rounded-md relative block px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-gray-50",
                  errors.businessProfile?.officeAddress?.zipcode?.message &&
                    "!border-danger !ring-danger"
                )}
                placeholder="우편번호"
                {...register("businessProfile.officeAddress.zipcode", {
                  required: "우편번호를 입력하세요.",
                })}
              />
              <input
                readOnly
                required
                className={clsx(
                  "flex-1 h-fit appearance-none rounded-md relative block px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 bg-gray-50",
                  errors.businessProfile?.officeAddress?.base?.message &&
                    "!border-danger !ring-danger"
                )}
                placeholder="주소 검색 버튼을 클릭하세요"
                {...register("businessProfile.officeAddress.base", {
                  required: "주소를 입력하세요.",
                })}
              />
              <Button
                onClick={(e) => openPostModal(e, "actual")}
                className="w-22 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm font-medium rounded-md text-white"
                variant="default"
              >
                주소검색
              </Button>
            </div>
            <input
              className={clsx(
                "appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900",
                errors.businessProfile?.officeAddress?.detail?.message &&
                  "!border-danger !ring-danger mb-0"
              )}
              placeholder="상세 주소를 입력하세요 (동, 호수 등)"
              {...register("businessProfile.officeAddress.detail", {
                required: "상세 주소를 입력하세요.",
              })}
            />

            {errors.businessProfile?.officeAddress?.detail?.message && (
              <div className="text-danger text-sm pl-2">
                화원실제주소를 입력하세요.
              </div>
            )}
          </div>
        </div>

        <div>
          {/* 사업자등록번호 */}
          <FormInput
            label="사업자 등록번호"
            placeholder="사업자등록번호를 입력하세요 (- 제외)"
            isRequired={true}
            error={errors.businessProfile?.businessNumber?.message}
            {...register("businessProfile.businessNumber", {
              required: "사업자등록번호를 입력하세요.",
            })}
          ></FormInput>
        </div>

        {/* 이메일 */}
        {/* <FormInput
          label="이메일"
          placeholder="이메일을 입력하세요"
          type="email"
        ></FormInput> */}

        <div className="grid md:grid-cols-2 md:gap-6">
          {/* 상호명 */}
          <FormInput
            label="법인명"
            placeholder="법인명을 입력하세요"
            isRequired={true}
            error={errors.businessProfile?.corpName?.message}
            {...register("businessProfile.corpName", {
              required: "상호명을 입력하세요.",
            })}
          ></FormInput>

          {/* 대표자 성함 */}
          <FormInput
            label="대표자 성함"
            placeholder="대표자 성함을 입력하세요"
            isRequired={true}
            error={errors.businessProfile?.ceoName?.message}
            {...register("businessProfile.ceoName", {
              required: "대표자명을 입력하세요.",
            })}
          />
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          {/* 업태 */}
          <FormInput
            label="업태"
            placeholder="업태을 입력하세요"
            isRequired={true}
            error={errors.businessProfile?.businessType?.message}
            {...register("businessProfile.businessType", {
              required: "업종을 입력하세요.",
            })}
          />

          {/* 종목 */}
          <FormInput
            label="종목"
            placeholder="종목을 입력하세요"
            isRequired={true}
            error={errors.businessProfile?.businessItem?.message}
            {...register("businessProfile.businessItem", {
              required: "종목을 입력하세요.",
            })}
          />
        </div>

        <div>
          {/* 사업장 주소 */}
          <FormInput
            isRequired={true}
            label="사업장 주소"
            placeholder="사업장 주소를 입력하세요."
            error={errors.businessProfile?.companyAddress?.message}
            {...register("businessProfile.companyAddress", {
              required: "사업장 주소를 입력하세요.",
            })}
          />
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          <Controller
            control={control}
            name="businessCertFile"
            rules={{ required: "사업자등록증을 업로드하세요." }}
            render={({ field }) => (
              <FormInput
                type="file"
                label="사업자등록증"
                isRequired={true}
                accept="image/*"
                error={errors.businessCertFile?.message}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  field.onChange(file);
                }}
              />
            )}
          />
        </div>

        {/* <div className="border-b-2 border-b-gray-200 border-dashed my-8" /> */}

        <div className="my-2 tracking-tight">
          <label className="text-sm">
            계좌번호<span className="sf-req">*</span>
          </label>
          <div className="grid md:grid-cols-3 md:gap-4">
            <input
              className={clsx(
                "w-full border border-input px-3 p-2 my-2 rounded-md",
                errors.businessProfile?.bankName?.message && "!border-danger !mb-0"
              )}
              placeholder="은행"
              {...register("businessProfile.bankName", {
                required: "은행을 입력하세요.",
              })}
            />
            <input
              className={clsx(
                "w-full border border-input px-3 p-2 my-2 rounded-md",
                errors.businessProfile?.accountNumber?.message && "!border-danger !mb-0"
              )}
              placeholder="계좌번호"
              {...register("businessProfile.accountNumber", {
                required: "계좌번호를 입력하세요.",
              })}
            />
            <input
              className={clsx(
                "w-full border border-input px-3 p-2 my-2 rounded-md",
                errors.businessProfile?.accountOwner?.message && "!border-danger !mb-0"
              )}
              placeholder="예금주"
              {...register("businessProfile.accountOwner", {
                required: "예금주를 입력하세요.",
              })}
            />
          </div>
          <p className="text-sm text-default relative bottom-2 mt-2">
            (대표자와 통장 명의가 다른 경우 입금되지 않습니다.)
          </p>
        </div>

        <div className="grid md:grid-cols-2 md:gap-6">
          <Controller
            control={control}
            name="bankCertFile"
            rules={{ required: "통장 사본을 업로드하세요." }}
            render={({ field }) => (
              <FormInput
                type="file"
                label="통장 사본"
                isRequired={true}
                error={errors.bankCertFile?.message}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  field.onChange(file);
                }}
              />
            )}
          />
        </div>

        <div className="flex justify-between pt-10">
          <button
            type="button"
            onClick={prevStep}
            className="sf-btn sf-btn--xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transform transition-all duration-300 hover:scale-[1.02]"
          >
            이전 단계
          </button>
          <button type="submit" className="sf-btn sf-btn--primary sf-btn--xl">
            가입신청
          </button>
        </div>

        {/* Daum 우편번호 검색 모달 */}
        {showPostModal && (
          <div className="fixed top-[43%] md:top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[600px] bnb_md_xl:max-w-[600px] bnb_sm:max-w-[85%] z-[1000]">
            <div onClick={() => setShowPostModal(false)} className="pb-8">
              <span className="float-right text-xl font-bold">X</span>
            </div>
            <PostCode onComplete={handleComplete} className="border" />
          </div>
        )}

        {/* 지역검색 모달 */}
        <Modal
          isOpen={isOpenSearchRegionModal}
          title="지역선택"
          onCancel={() => setIsOpenSearchRegionModal(false)}
          onConfirm={handleSearchRegionSave}
          hasFooter={false}
          size="lg"
        >
          <RegionSelector
            onRegionSelect={(sido, sigungu) => {
              console.log("선택된 지역:", sido, sigungu);
              setValue("activityRegions.sido", sido);
              setValue("activityRegions.sigungu", sigungu);
              setValue("activityRegions.full", sido + " " + sigungu);
              setIsOpenSearchRegionModal(false);
            }}
          />
        </Modal>

        {/* 배송지역 설정 모달 */}
        <Modal
          isOpen={isOpenDeliveryRegionModal}
          title="배송지역 설정"
          confirmText="저장"
          cancelText="닫기"
          onCancel={() => setIsOpenDeliveryRegionModal(false)}
          onConfirm={handleDeliveryRegionSave}
          hasFooter={true}
          size="xl"
        >
          <ProductPriceTable />
        </Modal>
      </form>
    </div>
  );
};

export default RegisterForm;
