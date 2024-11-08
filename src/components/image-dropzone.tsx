import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { IDropZoneProps } from "../interface/profie-interface";

const Zone = styled.div`
  border: 2px dotted ${(props) => props.theme.dropArea.fromThis};
  height: 100%;
  width: 100%;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  &:hover {
    cursor: pointer;
  }
  p {
    font-size: 13px;
  }
`;

export function ImageDropZone({ username, token, uploadFn }: IDropZoneProps) {
  const queryClient = useQueryClient();

  const uploadImgMutation = useMutation({
    mutationFn: (data: File) => uploadFn({ username, imgData: data }, token),
    onError: () => {
      // 에러 핸들링
      alert("Fail to upload image.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  const onDrop = useCallback(
    async (files: File[]) => {
      if (files.length > 0) {
        files.forEach((file) => {
          uploadImgMutation.mutate(file);
        });
      }
    },
    [uploadImgMutation]
  );

  const { getInputProps, getRootProps, isDragActive } = useDropzone({ onDrop });

  return (
    <Zone {...getRootProps()}>
      <input {...getInputProps()} />
      {uploadImgMutation.isPending ? (
        <p>Uploading...</p>
      ) : isDragActive ? (
        <p>Drop your image here!</p>
      ) : (
        <>
          <p>Drag here or click</p>
          <p>to upload your image!</p>
        </>
      )}
    </Zone>
  );
}
