import { Promise as BPromise } from 'bluebird';
import { message, notification } from 'antd';

export interface IUploadImageSignData {
  res: number;
  msg: string;
  data: {
    sign: string;
    timestamp: string;
  };
}

export interface IUploadImageData {
  res: number;
  msg: string;
  data: {
    AWSAccessKeyId: string;
    key: string;
    acl: string;
    success_action_status: string;
    Policy: string;
    Signature: string;
    uploadURL: string;
    cdn_host: string;
    timestamp: string;
  }
}

export const api = <T>(path: string, apiType: 'base' | 'upload' | 'purge' = 'base') => {
  // const baseUrl = apiType === 'base' ? 'http://api-common.dev.sina-shangke.com' : 'http://34.85.47.175:8085';
  let baseUrl: string;
  switch (apiType) {
    case 'base':
      baseUrl = 'http://api-common.dev.sina-shangke.com';
      break;
    case 'upload':
      baseUrl = 'http://34.85.47.175:8085';
      break;
    case 'purge':
      baseUrl = 'http://api-common.test.sina-shangke.com'
      break;
  }
  const formData: FormData = new FormData();
  let requestParam: { [key: string]: any } = {};
  let mock: boolean = false;
  let mockData: T;

  const token = localStorage.getItem('accessToken');

  formData.set('accessToken', token!);

  const setParam = (params: { [key: string]: any }) => {
    requestParam = {
      ...requestParam,
      ...params,
    };

    for (const key in requestParam) {
      if (params.hasOwnProperty(key)) {
        const value = params[key];

        formData.set(key, value);
      }
    }

    return {
      request,
    };
  };

  const setStringParam = (params: string) => {
    requestParam = {
      ...requestParam,
      param_list: params,
    }
        formData.set('param_list', params);

    return {
      request,
    };
  };

  const setMock = (mData: T) => {
    mock = true;
    mockData = mData;

    return {
      request,
    };
  };

  const fetchApi = async () => {
    if (!token) {
      message.error('accessToken not found!');
      await BPromise.delay(500);
      window.location.href = '';
      return BPromise.resolve({ res: 'error', msg: 'accessToken not found!' });
    }

    if (mock) {
      await BPromise.delay(500);
      return BPromise.resolve(mockData);
    }
    else {
      return fetch(`${baseUrl}${path}`, { method: 'POST', body: formData })
        .then((res) => res.json())
        .catch((res) => ({ error: true, res: -10001, msg: res }));
    }
  };

  const request = async (): Promise<T> => {
    console.log('┌---- CMS API REQUEST -----------------------------┐');
    console.log(`│  ${baseUrl}${path}`);
    console.log('│', { accessToken: token, ...requestParam });
    console.log('└--------------------------------------------------┘');
    console.log('');

    const res: any = await BPromise.race([
      fetchApi(),
      BPromise.delay(30000).then(() => {
        return { res: -1, msg: 'API CALL TIME OUT!!' }
      }),
    ]);

    console.log('');
    mock
      ? console.log('┌===== MOCK RESULT ===============================┐')
      : console.log('┌===== RESULT ====================================┐');
    console.log(`│  ${baseUrl}${path}`);
    console.log('│', { ...res, params: { accessToken: token, ...requestParam } });
    console.log('└=================================================┘');
    console.log('');
    console.log('');

    if (res.res === 0) {
      return BPromise.resolve(res);

    }
    else if (res.res === 3100) {
      localStorage.removeItem('accessToken');
      message.error('Login Session has expired.');
      await BPromise.delay(500);
      window.location.href = '';
      return BPromise.resolve(res);
    }
    else if (res.res === -1) {
      notification.error({
        message: 'Error',
        description:
          'API CALL FAILED. ( TIME OUT )',
        duration: 60000,
      });

      return await request();
    }
    else {
      // return BPromise.reject({} as T);
      return BPromise.reject({
        res, requestParam
      });
    }
  };

  return {
    setParam,
    setStringParam,
    setMock,
    request,
  };
};

export const uploadApi = async (fileObj: { biz_type: number, content_type: string, file_name: string, path: string }, file: File) => {
  const res = await api<IUploadImageData>('/v1/cms/image/sign/result', 'upload').setParam(fileObj).request();
  
  const { data } = res;

  const url = `${data.uploadURL}${data.key}`;

  const form = new FormData();
  form.append("AWSAccessKeyId", data.AWSAccessKeyId);
  form.append("key", data.key);
  form.append("acl", data.acl);
  form.append("success_action_status", data.success_action_status);
  form.append("Policy", data.Policy);
  form.append("Signature", data.Signature);
  form.append("file", file);

  const resSina = await fetch(data.uploadURL, { method: 'post', body: form });

  const r = { url, resSina }

  return r;
}

export const purgeApi = async (fileList: string[] ) => {
  if (!fileList.length) {
    return;
  }

  const formData: FormData = new FormData();
    formData.append('url_list', JSON.stringify(fileList));

    console.log('┌---- PURGE API REQUEST -----------------------------┐');
    console.log(`│  http://api-common.test.sina-shangke.com/image/image/purge`);
    console.log('│', { 'url_list': fileList });
    console.log('└--------------------------------------------------┘');
    console.log('');

    try {
      const fetchPurge = await fetch('http://api-common.test.sina-shangke.com/image/image/purge', { method: 'POST', body: formData })
      console.log('┌===== RESULT ====================================┐');
        console.log(`│  http://api-common.test.sina-shangke.com/image/image/purge`);
        console.log('│', { ok: fetchPurge.ok, status: fetchPurge.status, msg: fetchPurge.statusText });
        console.log('└=================================================┘');
        console.log('');
        return BPromise.resolve(true);
    } catch (error) {
      console.log('purgeApi false')
      return BPromise.resolve(false);
      };

}

// export const uploadMultiApi = async (
//   fileObjList: string,
//   fileList: IImgInfoMulti[]) => {

//   const res = await api<IUploadImageSignData>('/v1/cms/image/sign/multi', 'upload').setStringParam(fileObjList).request();
  
//   const { data } = res;

//   const tempParam = {
//     sign: data.sign,
//     timestamp: data.timestamp.toString(),
//     param_list: JSON.parse(fileObjList),
//   };

//   console.log(tempParam);
  
//   const rSina = await api<IUploadImageData>('/image/image/multi-form-config', 'base').setParam(tempParam).request();

//   console.log(rSina.data);

  // const url = `${rSina.data.uploadURL}${rSina.data.key}`;

  // const form = new FormData();
  // form.append("AWSAccessKeyId", rSina.data.AWSAccessKeyId);
  // form.append("key", rSina.data.key);
  // form.append("acl", rSina.data.acl);
  // form.append("success_action_status", rSina.data.success_action_status);
  // form.append("Policy", rSina.data.Policy);
  // form.append("Signature", rSina.data.Signature);
  // form.append("file", file);

  // const resSina = await fetch(rSina.data.uploadURL, { method: 'post', body: form });

  // const r = { url, resSina }

  // return r;
// }